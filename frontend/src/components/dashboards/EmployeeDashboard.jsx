import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle2, ListTodo } from 'lucide-react';
import api from '../../services/api';

const EmployeeDashboard = () => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isWeekend, setIsWeekend] = useState(false);
    const [isOnLeave, setIsOnLeave] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingTasks: 0,
        leaveBalance: 12, // For demo purposes, assuming 12 default days a year minus taken
        recentTasks: [],
        announcements: [],
    });

    const fetchDashboardData = async () => {
        try {
            const [attRes, leafRes, taskRes, annRes] = await Promise.all([
                api.get('/attendance'),
                api.get('/leaves'),
                api.get('/tasks'),
                api.get('/announcements')
            ]);

            // Check if user is checked in today
            const today = new Date().toDateString();
            const todayAttendance = attRes.data.data.find(record => new Date(record.date).toDateString() === today);

            if (todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut) {
                setIsCheckedIn(true);
            } else {
                setIsCheckedIn(false);
            }

            // Check if today is weekend
            const todayVal = new Date();
            const dayOfWeek = todayVal.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                setIsWeekend(true);
            } else {
                setIsWeekend(false);
            }

            // Check if on leave today
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            const todayOnLeave = leafRes.data.data.some(leave => {
                if (leave.status !== 'Approved') return false;
                const start = new Date(leave.startDate); start.setHours(0, 0, 0, 0);
                const end = new Date(leave.endDate); end.setHours(23, 59, 59, 999);
                return todayMidnight >= start && todayVal <= end;
            });
            setIsOnLeave(todayOnLeave);

            // Calculate active leaves taken
            const approvedLeaves = leafRes.data.data.filter(leave => leave.status === 'Approved').length;
            const remainingLeaves = Math.max(0, 12 - approvedLeaves);

            // Calculate pending tasks and top 3 recent tasks
            const pending = taskRes.data.data.filter(task => task.status !== 'Completed');

            setStats({
                pendingTasks: pending.length,
                leaveBalance: remainingLeaves,
                recentTasks: taskRes.data.data.slice(0, 3), // Get latest 3 assigned tasks
                announcements: annRes.data.data
            });

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCheckInToggle = async () => {
        if (!isCheckedIn) {
            if (isWeekend) {
                const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                alert(`Today is ${dayName}. You cannot check in.`);
                return;
            }
            if (isOnLeave) {
                alert("You are on leave today. You cannot check in.");
                return;
            }
        }

        try {
            if (!isCheckedIn) {
                await api.post('/attendance/check-in');
                setIsCheckedIn(true);
            } else {
                await api.put('/attendance/check-out');
                setIsCheckedIn(false);
            }
            fetchDashboardData(); // Refresh data just in case
        } catch (err) {
            alert(err.response?.data?.error || 'Error recording attendance');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your space...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Attendance Widget */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <h3 className="text-xl font-semibold opacity-90">Today's Attendance</h3>
                            <p className="text-blue-100 mt-1">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="mt-8 flex items-end justify-between">
                            <div>
                                <p className="text-sm text-blue-100 mb-1">Status</p>
                                {isCheckedIn ? (
                                    <div className="flex items-center text-2xl font-bold">
                                        <CheckCircle2 className="w-6 h-6 mr-2 text-green-300" />
                                        Checked In
                                    </div>
                                ) : (
                                    <div className="flex items-center text-2xl font-bold">
                                        <Clock className="w-6 h-6 mr-2 text-yellow-300" />
                                        Not Checked In
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCheckInToggle}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md transform ${!isCheckedIn && (isWeekend || isOnLeave)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : isCheckedIn
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white hover:scale-105 active:scale-95'
                                        : 'bg-white text-blue-600 hover:bg-gray-50 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isCheckedIn ? 'Check Out' : 'Check In Now'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mini Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-gray-400 font-medium">Leave Balance</h3>
                        <div className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.leaveBalance} <span className="text-lg font-normal text-gray-400">days</span></div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-gray-400 font-medium">Pending Tasks</h3>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            <ListTodo className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</div>
                </div>

            </div>

            {/* Notice Board */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Notice Board</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.announcements.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No active announcements.</p>
                    ) : (
                        stats.announcements.map((notice) => (
                            <div key={notice._id} className="relative p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition-shadow group">
                                <div className="flex items-center space-x-2 mb-3">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${notice.priority === 'Urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        notice.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {notice.priority}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{notice.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{notice.content}</p>
                                <p className="text-xs text-gray-400 mt-4 font-medium">- {notice.authorId?.name || 'HR'}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recents */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Recent Tasks</h3>
                {stats.recentTasks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent tasks assigned to you right now.</p>
                ) : (
                    <div className="space-y-4">
                        {stats.recentTasks.map((task) => (
                            <div key={task._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
