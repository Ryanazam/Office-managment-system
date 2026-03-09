import React, { useState, useEffect, useContext } from 'react';
import { CheckSquare, Clock, AlertCircle, Plus, X } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        deadline: ''
    });

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        if (user?.role === 'manager') {
            try {
                const res = await api.get('/employees');
                setEmployees(res.data.data);
                if (res.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, assignedTo: res.data.data[0]._id }));
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
            }
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchEmployees();
    }, [user]);

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', formData);
            setShowModal(false);
            setFormData({ title: '', description: '', assignedTo: employees.length > 0 ? employees[0]._id : '', deadline: '' });
            fetchTasks();
        } catch (err) {
            console.error("Error assigning task", err);
            alert(err.response?.data?.error || 'Failed to assign task');
        }
    };

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            fetchTasks(); // refresh data
        } catch (err) {
            console.error("Error updating task status", err);
            alert(err.response?.data?.error || 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400';
            case 'In Progress': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400';
            default: return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Board</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {user?.role === 'manager' ? 'Assign and track employee tasks.' : 'Manage your assigned tasks.'}
                    </p>
                </div>

                {user?.role === 'manager' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Assign Task
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simple Kanban-like structure */}
                {['To Do', 'In Progress', 'Completed'].map((columnStatus) => (
                    <div key={columnStatus} className="bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-between">
                            {columnStatus}
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-sm">
                                {tasks.filter(t => t.status === columnStatus).length}
                            </span>
                        </h3>

                        <div className="space-y-4">
                            {loading && <p className="text-sm text-gray-500">Loading...</p>}
                            {!loading && tasks.filter(t => t.status === columnStatus).length === 0 && (
                                <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    No tasks here
                                </div>
                            )}
                            {tasks.filter(t => t.status === columnStatus).map((task) => (
                                <div
                                    key={task._id}
                                    className={`p-5 rounded-xl border-l-4 shadow-sm group hover:shadow-md transition-all ${getStatusColor(task.status)} bg-white dark:bg-gray-800 border-t border-r border-b`}
                                >
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                                        {task.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 break-words">
                                        {task.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3.5 h-3.5 mr-1" />
                                            Due {new Date(task.deadline).toLocaleDateString()}
                                        </div>
                                        {user?.role === 'manager' ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-[10px]" title={task.assignedTo?.name || 'Assigned'}>
                                                    {task.assignedTo?.name?.charAt(0) || 'E'}
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {task.assignedTo?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        ) : (
                                            <select
                                                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                                value={task.status}
                                                onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                            >
                                                <option value="To Do">To Do</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Assign Task Modal (Manager Only) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign New Task</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAssignTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Update Client Presentation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Task details..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                >
                                    {employees.length === 0 && <option value="" disabled>No employees found</option>}
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                                    disabled={employees.length === 0}
                                >
                                    Assign Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
