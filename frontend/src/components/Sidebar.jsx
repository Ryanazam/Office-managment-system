import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Clock,
    CalendarMinus,
    CheckSquare,
    MessageSquare,
    Video,
    LogOut,
    X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ onClose }) => {
    const { user, logout } = useContext(AuthContext);

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['employee', 'manager'] },
        { name: 'Messages', path: '/dashboard/chat', icon: MessageSquare, roles: ['employee', 'manager'] },
        { name: 'Employees', path: '/dashboard/employees', icon: Users, roles: ['manager'] },
        { name: 'Attendance', path: '/dashboard/attendance', icon: Clock, roles: ['employee', 'manager'] },
        { name: 'Leaves', path: '/dashboard/leaves', icon: CalendarMinus, roles: ['employee', 'manager'] },
        { name: 'Tasks', path: '/dashboard/tasks', icon: CheckSquare, roles: ['employee', 'manager'] },
        { name: 'Meetings', path: '/dashboard/meetings', icon: Video, roles: ['employee', 'manager'] },
    ];

    return (
        <div className="flex flex-col w-72 lg:w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200 shadow-sm relative">
            <div className="flex items-center justify-between lg:justify-center h-20 px-6 lg:px-0 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    WorkFlow
                </h1>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close Menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto pt-6 px-4 space-y-2">
                {links.map((link) => {
                    if (!link.roles.includes(user?.role)) return null;

                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium group",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100"
                                )
                            }
                        >
                            <Icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                            {link.name}
                        </NavLink>
                    );
                })}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={logout}
                    className="flex flex-row items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
