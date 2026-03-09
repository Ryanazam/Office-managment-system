import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import { Send, User as UserIcon, Loader2, ArrowLeft, Pencil, Trash2, X } from 'lucide-react';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [employees, setEmployees] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch list of employees to chat with
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/employees');
                // Exclude current user from the list
                const currentId = user._id || user.id;
                setEmployees(res.data.data.filter(emp => emp._id !== currentId));
            } catch (err) {
                console.error("Failed to load employees for chat");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, [user]);

    // Fetch chat history when a user is selected
    useEffect(() => {
        if (!selectedUser) return;

        const fetchChatHistory = async () => {
            try {
                const res = await api.get(`/messages/${selectedUser._id}`);
                setMessages(res.data.data);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to fetch chat history");
            }
        };

        fetchChatHistory();
    }, [selectedUser]);

    // Socket.io Real-Time Listener
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (incomingMessage) => {
            console.log("Real-time message received:", incomingMessage);
            if (selectedUser && String(incomingMessage.senderId) === String(selectedUser._id)) {
                setMessages(prev => [...prev, incomingMessage]);
                scrollToBottom();
            }
        };

        const handleUpdateMessage = (updatedMessage) => {
            setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
        };

        const handleDeleteMessage = (deletedMessage) => {
            setMessages(prev => prev.map(msg => msg._id === deletedMessage._id ? deletedMessage : msg));
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('update_message', handleUpdateMessage);
        socket.on('delete_message', handleDeleteMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('update_message', handleUpdateMessage);
            socket.off('delete_message', handleDeleteMessage);
        };
    }, [socket, selectedUser]);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            if (editingMsgId) {
                // Update existing message
                const res = await api.put(`/messages/${editingMsgId}`, {
                    content: newMessage
                });
                setMessages(prev => prev.map(msg => msg._id === editingMsgId ? res.data.data : msg));
                setEditingMsgId(null);
            } else {
                // Send new message
                const res = await api.post('/messages', {
                    receiverId: selectedUser._id,
                    content: newMessage
                });
                setMessages(prev => [...prev, res.data.data]);
                scrollToBottom();
            }
            setNewMessage('');
        } catch (err) {
            console.error(err);
            alert("Failed to send message. Please try again.");
        }
    };

    const handleStartEdit = (msg) => {
        setEditingMsgId(msg._id);
        setNewMessage(msg.content);
    };

    const handleCancelEdit = () => {
        setEditingMsgId(null);
        setNewMessage('');
    };

    const handleDelete = async (msgId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const res = await api.delete(`/messages/${msgId}`);
            setMessages(prev => prev.map(msg => msg._id === msgId ? res.data.data : msg));
        } catch (err) {
            console.error("Failed to delete message", err);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in duration-500">
            {/* Left Sidebar: Contact List */}
            <div className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-800/20 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chat natively with your team.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {employees.map(emp => (
                        <div
                            key={emp._id}
                            onClick={() => setSelectedUser(emp)}
                            className={`flex items-center space-x-4 p-3 rounded-2xl cursor-pointer transition-all ${selectedUser?._id === emp._id
                                ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                                : 'hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden transition-colors ${selectedUser?._id === emp._id
                                ? 'bg-white/20 text-white'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300'
                                }`}>
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold">{emp.name}</h4>
                                <p className={`text-xs ${selectedUser?._id === emp._id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)} - {emp.department}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Chat Window */}
            {selectedUser ? (
                <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {/* Chat Header */}
                    <div className="h-20 border-b border-gray-100 dark:border-gray-800 px-4 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Click to chat natively</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900/10">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Send className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No messages yet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                    Send a message to {selectedUser.name} to start a new real-time conversation.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const currentId = user._id || user.id;
                                const isMe = msg.senderId === currentId;
                                return (
                                    <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group mb-2`}>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                                            <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                                {/* Action Buttons */}
                                                {isMe && !msg.isDeleted && (
                                                    <div className="hidden group-hover:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleStartEdit(msg)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors" title="Edit message">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(msg._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors" title="Delete message">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Bubble Text Component */}
                                                <div
                                                    className={`w-fit px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl flex-shrink-0 shadow-sm ${msg.isDeleted ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 italic border border-gray-200 dark:border-gray-700' : isMe
                                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
                                                        }`}
                                                >
                                                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                                                        {msg.isDeleted ? "🚫 This message was deleted" : msg.content}
                                                        {msg.isEdited && !msg.isDeleted && <span className="text-[10px] opacity-70 ml-2" title="Edited">(edited)</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 font-medium px-2 opacity-70">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Box */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        {editingMsgId && (
                            <div className="flex items-center justify-between mb-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium animate-in slide-in-from-bottom-2 fade-in">
                                <div className="flex items-center">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Editing message
                                </div>
                                <button type="button" onClick={handleCancelEdit} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex space-x-3 md:space-x-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={editingMsgId ? "Edit your message..." : `Message ${selectedUser.name}...`}
                                className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors border border-transparent focus:border-blue-300 dark:focus:border-blue-600 rounded-full md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-gray-900 dark:text-white font-medium text-sm md:text-base"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className={`w-12 h-12 md:w-14 md:h-14 ${editingMsgId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full md:rounded-2xl flex items-center justify-center transition-all shadow-md transform active:scale-95 flex-shrink-0`}
                            >
                                <Send className="w-5 h-5 md:w-6 md:h-6 md:ml-1" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex flex-col items-center justify-center mb-6 shadow-inner ring-1 ring-blue-100 dark:ring-blue-900/50">
                        <UserIcon className="w-10 h-10 text-blue-500 mb-2 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Seamless Messaging</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Select a colleague from the sidebar to start collaborating.</p>
                </div>
            )}
        </div>
    );
};

export default Chat;
