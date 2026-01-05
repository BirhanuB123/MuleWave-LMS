import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { FaPaperPlane, FaCircle, FaUsers } from 'react-icons/fa';
import api from '../utils/api';
import '../styles/Chat.css';

const ChatMessage = ({ message, isOwnMessage }) => (
    <div className={`chat-message ${isOwnMessage ? 'own-message' : ''} ${message.isInstructor ? 'instructor-message' : ''}`}>
        <div className="message-content">
            <p className="message-text">{message.message}</p>
            <div className="message-info">
                <span className="sender-name">
                    {`${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim()}
                    {message.isInstructor && <span className="instructor-badge">Instructor</span>}
                </span>
                <span className="message-time">
                    {format(new Date(message.timestamp || message.createdAt), 'HH:mm')}
                </span>
            </div>
        </div>
    </div>
);

const ChatWindow = ({ courseId, socket, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showOnlineUsers, setShowOnlineUsers] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/chat/${courseId}/messages`, { params: { page, limit: 50 } });
                const data = response.data;
                if (data.success) {
                    if (page === 1) {
                        setMessages(data.data);
                        setTimeout(scrollToBottom, 100);
                    } else {
                        setMessages(prev => [...data.data, ...prev]);
                    }
                    setHasMore(data.data.length === 50);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setError('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [courseId, page]);

    // Socket event handlers
    useEffect(() => {
        if (socket) {
            console.log('Setting up socket listeners for course:', courseId);
            
            // Join course room
            socket.emit('join_course', courseId);

            // Listen for new messages
            socket.on('new_message', (message) => {
                console.log('Received new message:', message);
                setMessages(prev => [...prev, message]);
                setTimeout(scrollToBottom, 100);
            });

            // Listen for online users updates
            socket.on('online_users', (users) => {
                console.log('Online users updated:', users);
                setOnlineUsers(users);
            });

            // Listen for user joined
            socket.on('user_joined', (data) => {
                console.log('User joined:', data);
            });

            // Listen for user left
            socket.on('user_left', (data) => {
                console.log('User left:', data);
            });

            // Listen for typing indicator
            socket.on('user_typing', ({ userId, userName, isTyping }) => {
                if (userId !== currentUser._id) {
                    setTypingUsers(prev => {
                        if (isTyping) {
                            return [...prev.filter(u => u.userId !== userId), { userId, userName }];
                        } else {
                            return prev.filter(u => u.userId !== userId);
                        }
                    });
                }
            });

            // Listen for joined confirmation
            socket.on('joined_course', (data) => {
                console.log('Successfully joined course chat:', data);
                setOnlineUsers(data.onlineUsers || []);
            });

            // Listen for errors
            socket.on('error', (error) => {
                console.error('Socket error:', error);
                setError(error.message);
            });

            // Cleanup
            return () => {
                console.log('Cleaning up socket listeners');
                socket.emit('leave_course', courseId);
                socket.off('new_message');
                socket.off('online_users');
                socket.off('user_joined');
                socket.off('user_left');
                socket.off('user_typing');
                socket.off('joined_course');
                socket.off('error');
            };
        }
    }, [socket, courseId, currentUser, scrollToBottom]);

    // Handle message input change with typing indicator
    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        if (socket && !isTyping) {
            setIsTyping(true);
            socket.emit('typing', { courseId, isTyping: true });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            if (socket && isTyping) {
                setIsTyping(false);
                socket.emit('typing', { courseId, isTyping: false });
            }
        }, 1000);
    };

    // Send message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        // Clear typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isTyping) {
            setIsTyping(false);
            socket.emit('typing', { courseId, isTyping: false });
        }

        // Send message
        socket.emit('send_message', {
            courseId,
            message: newMessage.trim()
        });

        setNewMessage('');
    };

    // Handle scroll for loading more messages
    const handleScroll = (e) => {
        const element = e.target;
        if (element.scrollTop === 0 && hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    };

    if (loading && page === 1) {
        return (
            <div className="chat-window">
                <div className="chat-loading">
                    <div className="spinner"></div>
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error && messages.length === 0) {
        return (
            <div className="chat-window">
                <div className="chat-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            {/* Chat Header */}
            <div className="chat-header">
                <h3>Course Chat</h3>
                <div className="chat-header-actions">
                    <button 
                        className="online-users-toggle"
                        onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                        title="Online Users"
                    >
                        <FaUsers />
                        <span className="online-count">{onlineUsers.length}</span>
                    </button>
                </div>
            </div>

            {/* Online Users Dropdown */}
            {showOnlineUsers && (
                <div className="online-users-list">
                    <h4>Online Users ({onlineUsers.length})</h4>
                    {onlineUsers.map((user, index) => (
                        <div key={index} className="online-user-item">
                            <FaCircle className="online-indicator" />
                            <span>{user.userName}</span>
                            {user.isInstructor && <span className="instructor-badge-small">Instructor</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Messages Container */}
            <div className="messages-container" onScroll={handleScroll}>
                {loading && page > 1 && (
                    <div className="loading-more">Loading more messages...</div>
                )}
                {messages.map((message, index) => (
                    <ChatMessage
                        key={message._id || index}
                        message={message}
                        isOwnMessage={message.sender._id === currentUser._id}
                    />
                ))}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        <span className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                        <span className="typing-text">
                            {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="message-input"
                    maxLength={500}
                />
                <button 
                    type="submit" 
                    className="send-button"
                    disabled={!newMessage.trim()}
                    title="Send message"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;