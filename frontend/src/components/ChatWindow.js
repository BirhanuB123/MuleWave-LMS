import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import '../styles/Chat.css';

const ChatMessage = ({ message, isOwnMessage }) => (
    <div className={`chat-message ${isOwnMessage ? 'own-message' : ''}`}>
        <div className="message-content">
            <p className="message-text">{message.message}</p>
            <div className="message-info">
                <span className="sender-name">{message.sender.name}</span>
                <span className="message-time">
                    {format(new Date(message.timestamp), 'HH:mm')}
                </span>
            </div>
        </div>
    </div>
);

const ChatWindow = ({ courseId, socket, currentUser }) => {
    console.log('ChatWindow props:', { courseId, socket, currentUser });

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/chat/${courseId}/messages?page=${page}`);
                const data = await response.json();
                
                if (data.success) {
                    setMessages(prev => [...data.data, ...prev]);
                    setHasMore(data.data.length === 50); // Assuming 50 is the limit per page
                }
            } catch (err) {
                setError('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [courseId, page]);

    useEffect(() => {
        if (socket) {
            socket.emit('join_course', courseId);

            socket.on('new_message', (message) => {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            });

            socket.on('error', (error) => {
                setError(error.message);
            });

            return () => {
                socket.emit('leave_course', courseId);
                socket.off('new_message');
                socket.off('error');
            };
        }
    }, [socket, courseId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (socket) {
            socket.emit('send_message', {
                courseId,
                message: newMessage.trim()
            });
        }

        setNewMessage('');
    };

    const handleScroll = (e) => {
        const element = e.target;
        if (element.scrollTop === 0 && hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    };

    if (loading) return <div className="chat-loading">Loading messages...</div>;
    if (error) return <div className="chat-error">{error}</div>;

    return (
        <div className="chat-window">
            <div className="messages-container" onScroll={handleScroll}>
                {messages.map((message, index) => (
                    <ChatMessage
                        key={message._id || index}
                        message={message}
                        isOwnMessage={message.sender._id === currentUser._id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                />
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;