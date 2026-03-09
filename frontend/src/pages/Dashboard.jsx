import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Here is what's happening in your workspace today.
                </p>
            </div>

            {user.role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />}
        </div>
    );
};

export default Dashboard;
