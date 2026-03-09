import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [toastNotification, setToastNotification] = useState(null);

    useEffect(() => {
        if (user) {
            // Connect to Socket.io server using the exact same host the frontend is using
            const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5002`, {
                withCredentials: true,
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to WebSocket server:', newSocket.id);
                // Register personal room for private messaging
                newSocket.emit('join_personal', (user._id || user.id).toString());
            });

            // Global listener for notifications
            newSocket.on('receive_message', (incomingMessage) => {
                // Ignore if we are currently on the chat page and discussing with this person
                // (Optional refinement, but for now we just show a toast globally)
                setToastNotification({
                    title: 'New Message',
                    body: incomingMessage.content,
                    senderId: incomingMessage.senderId
                });

                // Auto dismiss after 5 seconds
                setTimeout(() => {
                    setToastNotification(null);
                }, 5000);
            });

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, toastNotification, setToastNotification }}>
            {children}
        </SocketContext.Provider>
    );
};
