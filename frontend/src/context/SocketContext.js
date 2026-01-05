import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            console.log('🔌 Initializing socket connection...');
            
            // Initialize socket connection with retry logic
            const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                auth: {
                    token
                },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                transports: ['websocket', 'polling']
            });

            // Connection successful
            socketInstance.on('connect', () => {
                console.log('✅ Socket connected successfully');
                setIsConnected(true);
                toast.success('Connected to chat server', {
                    position: 'bottom-right',
                    autoClose: 2000
                });
            });

            // Disconnection
            socketInstance.on('disconnect', (reason) => {
                console.log('❌ Socket disconnected:', reason);
                setIsConnected(false);
                
                if (reason === 'io server disconnect') {
                    // Server disconnected, try to reconnect manually
                    socketInstance.connect();
                }
            });

            // Connection error
            socketInstance.on('connect_error', (error) => {
                console.error('🔴 Socket connection error:', error.message);
                setIsConnected(false);
            });

            // Reconnection attempt
            socketInstance.on('reconnect_attempt', (attemptNumber) => {
                console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
            });

            // Reconnection successful
            socketInstance.on('reconnect', (attemptNumber) => {
                console.log(`✅ Reconnected successfully after ${attemptNumber} attempts`);
                setIsConnected(true);
                toast.info('Reconnected to chat server', {
                    position: 'bottom-right',
                    autoClose: 2000
                });
            });

            // Reconnection failed
            socketInstance.on('reconnect_failed', () => {
                console.error('❌ Failed to reconnect to socket server');
                toast.error('Failed to connect to chat server', {
                    position: 'bottom-right',
                    autoClose: 3000
                });
            });

            // Server error
            socketInstance.on('error', (error) => {
                console.error('🔴 Socket error:', error);
                toast.error(error.message || 'Chat error occurred', {
                    position: 'bottom-right',
                    autoClose: 3000
                });
            });

            setSocket(socketInstance);

            // Cleanup on unmount
            return () => {
                console.log('🔌 Disconnecting socket...');
                socketInstance.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            // No user or token, clean up socket
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};