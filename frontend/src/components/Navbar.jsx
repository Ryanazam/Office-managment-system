import React, { useContext, useEffect, useState } from 'react';
import { Sun, Moon, Bell, Check, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';

const Navbar = ({ onMenuClick }) => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [isDark, setIsDark] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data);
            setUnreadCount(res.data.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            const pseudoNotif = {
                _id: 'msg_' + (msg._id || Date.now()),
                title: 'New Chat Message',
                message: msg.content,
                isRead: false,
                createdAt: new Date().toISOString()
            };
            setNotifications(prev => [pseudoNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socket.on('receive_message', handleNewMessage);
        return () => socket.off('receive_message', handleNewMessage);
    }, [socket]);

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleMarkAsRead = async (id) => {
        if (id.toString().startsWith('msg_')) {
            // Dismiss volatile message notification from memory
            setNotifications(prev => prev.filter(n => n._id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
            return;
        }

        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');

            // Re-fetch system notifications but retain our local unread chat messages
            const res = await api.get('/notifications');
            const systemNotifs = res.data.data;

            // Keep existing volatile 'msg_' notifications
            setNotifications(prev => {
                const volatileNotifs = prev.filter(n => n._id.toString().startsWith('msg_'));
                return [...volatileNotifs, ...systemNotifs];
            });

            setUnreadCount(prev => {
                const volatileUnread = notifications.filter(n => n._id.toString().startsWith('msg_') && !n.isRead).length;
                return volatileUnread + systemNotifs.filter(n => !n.isRead).length;
            });

            setShowNotifications(false);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <header className="flex h-20 items-center justify-between px-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="p-2 mr-3 lg:hidden text-gray-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
                    aria-label="Toggle Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h2>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-2 border-white dark:border-gray-800 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-800 dark:text-white flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                Notifications
                                {unreadCount > 0 && (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                                            {unreadCount} New
                                        </span>
                                        <button onClick={handleMarkAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                                            Mark all read
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto w-full">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                        You have no notifications right now.
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`p-4 border-b border-gray-50 dark:border-gray-700/50 flex flex-col space-y-2 transition-colors ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'opacity-70'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{notif.title}</p>
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif._id)}
                                                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
