import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, Users, CalendarCheck, CheckSquare, MessageSquare, ArrowRight } from 'lucide-react';
import heroImage from '../assets/hero-office.png';

const features = [
    {
        icon: <Users className="w-6 h-6 text-blue-500" />,
        title: "Employee Directory",
        description: "Effortlessly manage your entire workforce with detailed profiles, roles, and departmental tracking."
    },
    {
        icon: <CalendarCheck className="w-6 h-6 text-emerald-500" />,
        title: "Attendance & Leaves",
        description: "Seamlessly track daily check-ins, monitor hours, and process time-off requests with integrated approval workflows."
    },
    {
        icon: <CheckSquare className="w-6 h-6 text-indigo-500" />,
        title: "Task Delegation",
        description: "Assign tasks, set crystal clear deadlines, and monitor real-time progress across all your active projects."
    },
    {
        icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
        title: "Native Messaging",
        description: "Communicate instantly with built-in real-time chat, supporting edit, delete, and direct notifications."
    }
];

const Landing = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="absolute top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3 cursor-pointer">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">Office<span className="text-blue-600">Sys</span></span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Go to Dashboard</Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden sm:block">Sign In</Link>
                                    <Link to="/login" className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-medium transition-transform active:scale-95 shadow-md">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow pt-20">
                <div className="relative overflow-hidden bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pb-40">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left flex flex-col justify-center">
                                <h1>
                                    <span className="block text-sm font-semibold uppercase tracking-wide text-blue-600">Introducing OfficeSys</span>
                                    <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                                        <span className="block text-gray-900">Manage your workspace</span>
                                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 pb-1">like never before.</span>
                                    </span>
                                </h1>
                                <p className="mt-5 text-base text-gray-500 sm:text-xl lg:text-lg xl:text-xl">
                                    The all-in-one platform designed to streamline employee management, track attendance, assign tasks, and foster seamless internal communication. built by Ryan.
                                </p>
                                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                                    {user ? (
                                        <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 md:text-lg">
                                            Return to Workspace
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                    ) : (
                                        <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 md:text-lg">
                                            Sign In to OfficeSys
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                                <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden transform transition-all hover:-translate-y-2 hover:shadow-blue-500/20 duration-500">
                                    <img
                                        className="w-full"
                                        src={heroImage}
                                        alt="Modern open-plan office workspace"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-gray-50 py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Everything you need</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                A better way to run your office
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                                Say goodbye to fragmented tools. OfficeSys brings your entire organization under one powerful, intuitive roof.
                            </p>
                        </div>

                        <div className="mt-16">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="pt-6 group">
                                        <div className="flow-root bg-white rounded-3xl px-6 pb-8 h-full shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                            <div className="-mt-6">
                                                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                                                    {feature.icon}
                                                </div>
                                                <h3 className="mt-8 text-lg font-bold text-gray-900 tracking-tight">{feature.title}</h3>
                                                <p className="mt-3 text-base text-gray-500 leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <span className="text-gray-400 hover:text-gray-500 cursor-pointer text-sm">Privacy Policy</span>
                        <span className="text-gray-400 hover:text-gray-500 cursor-pointer text-sm">Terms of Service</span>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1 flex items-center justify-center md:justify-start">
                        <Briefcase className="w-5 h-5 text-gray-400 mr-2" />
                        <p className="text-center text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} Office Management System. All rights reserved. Built by Ryan.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
