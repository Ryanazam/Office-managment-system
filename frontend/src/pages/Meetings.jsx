import React, { useState, useEffect, useContext } from 'react';
import { Video, Plus, Calendar, Link as LinkIcon, Users, Clock, Loader2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Meetings = () => {
    const { user } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        link: '',
        employeeIds: [],
        date: '',
        time: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [meetingRes, empRes] = await Promise.all([
                api.get('/meetings'),
                user?.role === 'manager' ? api.get('/employees') : Promise.resolve({ data: { data: [] } })
            ]);

            setMeetings(meetingRes.data.data);
            if (user?.role === 'manager') {
                setEmployees(empRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch meetings data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSchedule = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Combine date and time
            const combinedDate = new Date(`${formData.date}T${formData.time}`);

            await api.post('/meetings', {
                title: formData.title,
                link: formData.link,
                employeeIds: formData.employeeIds,
                date: combinedDate
            });

            setIsModalOpen(false);
            setFormData({ title: '', link: '', employeeIds: [], date: '', time: '' });
            fetchData(); // refresh list
        } catch (error) {
            alert(error.response?.data?.error || "Error scheduling meeting");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMeeting = async (meetingId) => {
        if (!window.confirm("Are you sure you want to delete this meeting?")) return;
        try {
            await api.delete(`/meetings/${meetingId}`);
            setMeetings(prev => prev.filter(m => m._id !== meetingId));
        } catch (error) {
            alert(error.response?.data?.error || "Error deleting meeting");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading meetings...</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out pb-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {user?.role === 'manager' ? 'Schedule and manage 1-on-1 meetings with your team.' : 'View your upcoming scheduled meetings.'}
                    </p>
                </div>

                {user?.role === 'manager' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Schedule Meeting
                    </button>
                )}
            </div>

            {/* Meetings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Meetings Scheduled</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {user?.role === 'manager' ? 'Click the button above to schedule a new meeting.' : 'You have no upcoming meetings at the moment.'}
                        </p>
                    </div>
                ) : (
                    meetings.map(meeting => (
                        <div key={meeting._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Video className="w-24 h-24 text-blue-600" />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pr-8 line-clamp-1">{meeting.title}</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                        <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                                        {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                        <Clock className="w-4 h-4 mr-3 text-blue-500" />
                                        {new Date(meeting.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-start text-gray-600 dark:text-gray-300 text-sm">
                                        <Users className="w-4 h-4 mr-3 text-blue-500 mt-1 flex-shrink-0" />
                                        {user?.role === 'manager' ? (
                                            <div className="flex flex-col">
                                                <span className="mb-1">With {meeting.employeeIds?.length} {meeting.employeeIds?.length === 1 ? 'employee' : 'employees'}:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {meeting.employeeIds?.map(emp => (
                                                        <span key={emp._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{emp.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <span>Organized by: <span className="font-semibold">{meeting.managerId?.name}</span></span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-2 w-full mt-4">
                                    <a
                                        href={meeting.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        Join Meeting Now
                                    </a>
                                    {user?.role === 'manager' && (
                                        <button
                                            onClick={() => handleDeleteMeeting(meeting._id)}
                                            className="px-4 py-2.5 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                            title="Delete Meeting"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Schedule Modal (Manager Only) */}
            {isModalOpen && user?.role === 'manager' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Schedule New Meeting</h2>

                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Monthly Performance Review"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Employees</label>
                                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-900/50 space-y-2">
                                    {employees.map(emp => (
                                        <label key={emp._id} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                checked={formData.employeeIds.includes(emp._id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        employeeIds: checked
                                                            ? [...prev.employeeIds, emp._id]
                                                            : prev.employeeIds.filter(id => id !== emp._id)
                                                    }));
                                                }}
                                            />
                                            <span className="text-sm text-gray-900 dark:text-gray-200">{emp.name} <span className="text-gray-500 text-xs">({emp.department})</span></span>
                                        </label>
                                    ))}
                                    {employees.length === 0 && <span className="text-sm text-gray-500">No employees found.</span>}
                                </div>
                                {formData.employeeIds.length === 0 && <p className="text-xs text-red-500 mt-1">Please select at least one employee.</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Link (Zoom, Meet, etc.)</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || formData.employeeIds.length === 0}
                                className="w-full flex justify-center items-center py-3 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Schedule Meeting'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;
