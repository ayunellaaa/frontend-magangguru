'use client';

import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, RefreshCcw, Maximize2, Minimize2, Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This month', value: 'thismonth' },
    { label: 'Last month', value: 'lastmonth' },
    { label: 'This Year', value: 'thisyear' },
    { label: 'Last Year', value: 'lastyear' },
    { label: 'All time', value: 'alltime' },
];
type FilterOption = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth' | 'thisyear' | 'lastyear' | 'alltime';
type BarDatum = { name: string; value: number; target: number; };
type LineDatum = { name: string; sales: number; revenue: number; };
type PieTum = { name: string; value: number; };
type Stats = { users: number; revenue: number; orders: number; growth: string; };

const generateDataByFilter = (filter: FilterOption) => {
    const multiplier = {
        today: 0.3,
        yesterday: 0.25,
        last7days: 0.6,
        last30days: 1,
        thismonth: 1.1,
        lastmonth: 0.9,
        thisyear: 1.5,
        lastyear: 1.3,
        alltime: 2,
    }
    const mult = multiplier[filter] ?? 1;

    return {
        bar: [
            { name: 'Jan', value: Math.round(4000 * mult), target: Math.round(3500 * mult) },
            { name: 'Feb', value: Math.round(3000 * mult), target: Math.round(3200 * mult) },
            { name: 'Mar', value: Math.round(5000 * mult), target: Math.round(4000 * mult) },
            { name: 'Apr', value: Math.round(4500 * mult), target: Math.round(4200 * mult) },
            { name: 'May', value: Math.round(6000 * mult), target: Math.round(5000 * mult) },
            { name: 'Jun', value: Math.round(5500 * mult), target: Math.round(5200 * mult) },
        ] as BarDatum[],
        line: [
            { name: 'Week 1', sales: Math.round(2400 * mult), revenue: Math.round(3400 * mult) },
            { name: 'Week 2', sales: Math.round(1398 * mult), revenue: Math.round(2210 * mult) },
            { name: 'Week 3', sales: Math.round(9800 * mult), revenue: Math.round(4290 * mult) },
            { name: 'Week 4', sales: Math.round(3908 * mult), revenue: Math.round(3000 * mult) },
        ] as LineDatum[],
        pie: [
            { name: 'Kelas A', value: Math.round(400 * mult) },
            { name: 'Kelas B', value: Math.round(300 * mult) },
            { name: 'Kelas C', value: Math.round(200 * mult) },
            { name: 'Kelas D', value: Math.round(100 * mult) },
        ] as PieTum[],
        stats: {
            users: Math.round(12345 * mult),
            revenue: Math.round(4678 * mult),
            orders: Math.round(3567 * mult),
            growth: (23.5 * mult).toFixed(1)
        } as Stats
    }
}

export default function AnalyticDashboardPage() {
    const [dateFilter, setDateFilter] = useState<FilterOption>('last7days');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countDown, setCountDown] = useState(60);
    const [fullscreenChart, setFullscreenChart] = useState<'bar' | 'line' | 'pie' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [barData, setBarData] = useState<BarDatum[]>([]);
    const [lineData, setLineData] = useState<LineDatum[]>([]);
    const [pieData, setPieData] = useState<PieTum[]>([]);
    const [Stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const data = generateDataByFilter(dateFilter);
            setBarData(data.bar);
            setLineData(data.line);
            setPieData(data.pie);
            setStats(data.stats);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [dateFilter]);

    // Menggunakan data dari state Stats (mengatasi penulisan typo spasi)
    const statsItems = [
        { title: 'Total Users', value: (Stats?.users ?? 0).toLocaleString(), icon: Users, bgColor: 'bg-blue-500', change: '+5.2%' },
        { title: 'Total Revenue', value: `$${(Stats?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, bgColor: 'bg-green-500', change: '+3.8%' },
        { title: 'Total Orders', value: (Stats?.orders ?? 0).toLocaleString(), icon: ShoppingCart, bgColor: 'bg-yellow-500', change: '+4.1%' },
        { title: 'Growth Rate', value: `${Stats?.growth ?? 0}%`, icon: TrendingUp, bgColor: 'bg-red-500', change: '+2.7%' },
    ];

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            setCountDown((prev) => {
                if (prev === 1) {
                    const data = generateDataByFilter(dateFilter);
                    setBarData(data.bar);
                    setLineData(data.line);
                    setPieData(data.pie);
                    setStats(data.stats);
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [autoRefresh, dateFilter]);

    const handleManualRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            const data = generateDataByFilter(dateFilter);
            setBarData(data.bar);
            setLineData(data.line);
            setPieData(data.pie);
            setStats(data.stats);
            setIsLoading(false);
            setCountDown(60);
        }, 500);
    }

    const handleFilterChange = (filterValue: FilterOption) => {
        setDateFilter(filterValue);
        setCountDown(60);
    }

    return (
        <MainLayout>
            <PageTransition>
                <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">

                        {/* Header */}
                        <div className="bg-white rounded-lg shadow border p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Analytic Dashboard</h1>
                                <p className="text-gray-500 mt-1">Real Time Analytics</p>
                                <p className="text-sm text-blue-600 mt-1 mb-5">
                                    Viewing data for: <strong>{FILTER_OPTIONS.find(f => f.value === dateFilter)?.label}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Filter dan Controls */}
                        <div className="bg-white rounded-lg shadow border p-4 mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Calendar className="text-gray-500" size={20} />
                                {FILTER_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilterChange(option.value)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${dateFilter === option.value
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Auto Refresh</label>
                                    <button
                                        onClick={() => setAutoRefresh(!autoRefresh)}
                                        className={`relative w-12 h-6 rounded-full transition ${autoRefresh ? "bg-blue-600" : "bg-gray-300"}`}
                                    >
                                        <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${autoRefresh ? "translate-x-6" : "translate-x-0"}`}></span>
                                    </button>
                                    {autoRefresh && (
                                        <span className="text-sm text-gray-500 font-mono ml-1">({countDown}s)</span>
                                    )}
                                </div>

                                <button
                                    onClick={handleManualRefresh}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {statsItems.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center transform transition-all duration-300 hover:scale-105 hover:-translate-y-1.5 hover:shadow-xl border border-slate-100 hover:border-blue-500/30 cursor-pointer">
                                    <div>
                                        <p className="text-gray-500 text-sm uppercase tracking-wide font-medium">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                                        <p className="text-green-600 text-sm mt-1 font-semibold">{stat.change}</p>
                                    </div>
                                    <div className={`${stat.bgColor} p-3 rounded-xl flex items-center justify-center`}>
                                        <stat.icon className="text-white" size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                            {/* Bar chart - Monthly Performance */}
                            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-700">Monthly Performance</h2>
                                    <button onClick={() => setFullscreenChart('bar')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                        <Maximize2 size={20} className="text-gray-600" />
                                    </button>
                                </div>
                                {/* Memberikan tinggi eksplisit h-[350px] agar Recharts ResponsiveContainer bisa merender grafik */}
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#3b82f6" name="Actual" />
                                            <Bar dataKey="target" fill="#10b981" name="Target" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pie Chart - Persentase Penjualan */}
                            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-700">Persentase Penjualan</h2>
                                    <button onClick={() => setFullscreenChart('pie')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                        <Maximize2 size={20} className="text-gray-600" />
                                    </button>
                                </div>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, percent }: any) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                                                outerRadius={100}
                                                dataKey='value'
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Line Chart Section */}
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-700">Grafik Pendapatan (Line Chart)</h2>
                                    <button onClick={() => setFullscreenChart('line')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                        <Maximize2 size={20} className="text-gray-600" />
                                    </button>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={lineData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            {/* Diperbaiki dari "month" menjadi "name" agar sesuai dengan object data line */}
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Sales" id="sales-line" />
                                            <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" id="revenue-line" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Fullscreen Overlay Chart Component */}
                        {fullscreenChart && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setFullscreenChart(null)}>
                                <div className="bg-white rounded-lg p-6 w-full max-w-6xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {fullscreenChart === 'bar' && 'Monthly Performance'}
                                            {fullscreenChart === 'line' && 'Weekly Trends'}
                                            {fullscreenChart === 'pie' && 'Distribution by Category'}
                                        </h2>
                                        <button onClick={() => setFullscreenChart(null)} className="hover:bg-gray-100 p-2 rounded-lg transition">
                                            <Minimize2 size={24} />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-h-0 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {fullscreenChart === 'bar' ? (
                                                <BarChart data={barData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="value" fill="#3b82f6" name="Actual" />
                                                    <Bar dataKey="target" fill="#10b981" name="Target" />
                                                </BarChart>
                                            ) : fullscreenChart === 'line' ? (
                                                <LineChart data={lineData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Sales" />
                                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
                                                </LineChart>
                                            ) : (
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={true}
                                                        label={(props: any) => `${props.name ?? ''} : ${props.percent ? (props.percent * 100).toFixed(0) : 0}%`}
                                                        outerRadius={160}
                                                        dataKey='value'
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </PageTransition>
        </MainLayout>
    );
}