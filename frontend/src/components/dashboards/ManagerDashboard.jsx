import React, { useState, useEffect } from 'react';
import { Users, Clock, CalendarCheck, CalendarOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, onLeave: 0, pendingTasks: 0 });
    const [attendanceData, setAttendanceData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', priority: 'Normal' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [empRes, attRes, leaveRes, taskRes, annRes] = await Promise.all([
                    api.get('/employees'),
                    api.get('/attendance'),
                    api.get('/leaves'),
                    api.get('/tasks'),
                    api.get('/announcements')
                ]);

                const today = new Date().toDateString();
                const todayAttendanceRecords = attRes.data.data.filter(record => new Date(record.date).toDateString() === today && record.checkIn);

                // Deduplicate by employee ID so one person = 1 present count
                const uniquePresentIds = new Set(todayAttendanceRecords.map(r => r.userId?._id?.toString() || r.userId?.toString()));
                const presentToday = uniquePresentIds.size;
                // Calculate active leaves taken just for TODAY
                const todayObj = new Date();
                todayObj.setHours(0, 0, 0, 0);

                const activeLeaves = leaveRes.data.data.filter(leave => {
                    if (leave.status !== 'Approved') return false;
                    const start = new Date(leave.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(leave.endDate);
                    end.setHours(23, 59, 59, 999);
                    return todayObj >= start && todayObj <= end;
                }).length;

                setStats({
                    totalEmployees: empRes.data.count || 0,
                    presentToday: presentToday,
                    onLeave: activeLeaves,
                    pendingTasks: taskRes.data.data.filter(task => task.status !== 'Completed').length
                });

                // Get Real Recent Activity (Last 5 check-ins)
                const activities = attRes.data.data
                    .filter(record => record.checkIn)
                    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                    .slice(0, 5);
                setRecentActivity(activities);

                // Calculate Real Attendance Data for the Last 5 Days
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const computedChartData = [];
                for (let i = 4; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = days[d.getDay()];

                    const presentCount = attRes.data.data.filter(record => {
                        const recordDate = new Date(record.date);
                        return recordDate.toDateString() === d.toDateString() && record.checkIn;
                    }).length;

                    computedChartData.push({ name: dayName, present: presentCount });
                }
                setAttendanceData(computedChartData);

                // Populate announcements
                setAnnouncements(annRes.data.data);

            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/announcements', newNotice);
            setAnnouncements([res.data.data, ...announcements]);
            setShowNoticeModal(false);
            setNewNotice({ title: '', content: '', priority: 'Normal' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to post notice');
        }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm("Delete this notice?")) return;
        try {
            await api.delete(`/announcements/${id}`);
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (err) {
            alert('Failed to delete notice');
        }
    };

    const statCards = [
        { title: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'from-blue-500 to-blue-600' },
        { title: 'Present Today', value: stats.presentToday, icon: Clock, color: 'from-emerald-500 to-emerald-600' },
        { title: 'On Leave', value: stats.onLeave, icon: CalendarOff, color: 'from-rose-500 to-rose-600' },
        { title: 'Pending Tasks', value: stats.pendingTasks, icon: CalendarCheck, color: 'from-amber-500 to-amber-600' },
    ];

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Attendance Overview (This Week)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity found.</p>
                        ) : (
                            recentActivity.map((activity) => {
                                const checkInTime = new Date(activity.checkIn);
                                const timeFormat = checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div key={activity._id} className="flex items-start space-x-4">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {activity.userId?.name || 'Someone'} checked in
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {checkInTime.toLocaleDateString()} at {timeFormat}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Notice Board */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Notice Board</h3>
                    <button
                        onClick={() => setShowNoticeModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                    >
                        + Add Notice
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No active announcements.</p>
                    ) : (
                        announcements.map((notice) => (
                            <div key={notice._id} className="relative p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition-shadow group">
                                <button
                                    onClick={() => handleDeleteNotice(notice._id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
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

            {/* Add Notice Modal */}
            {showNoticeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Post New Announcement</h2>
                        <form onSubmit={handleCreateNotice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newNotice.priority} onChange={e => setNewNotice({ ...newNotice, priority: e.target.value })}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Content</label>
                                <textarea
                                    required rows="4"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newNotice.content} onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowNoticeModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm">Post Notice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
