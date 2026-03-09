import React, { useContext, useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { MessageSquare, X } from 'lucide-react';

const Layout = () => {
    const { user, loading } = useContext(AuthContext);
    const { toastNotification, setToastNotification } = useContext(SocketContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden relative">

            {/* Global Toast Notification */}
            {toastNotification && (
                <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-80 flex items-start space-x-3 cursor-pointer hover:shadow-2xl transition-all" onClick={() => {
                        navigate('/chat');
                        setToastNotification(null);
                    }}>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{toastNotification.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{toastNotification.body}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setToastNotification(null); }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
            `}>
                <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
