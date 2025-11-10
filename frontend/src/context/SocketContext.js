import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

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
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            // Initialize socket connection
            const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                auth: {
                    token
                }
            });

            // Set up event listeners
            socketInstance.on('connect', () => {
                console.log('Socket connected');
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            socketInstance.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            setSocket(socketInstance);

            // Cleanup on unmount
            return () => {
                socketInstance.disconnect();
            };
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};