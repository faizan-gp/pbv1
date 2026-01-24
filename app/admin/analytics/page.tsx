'use client';

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import { Activity, Users, Eye, Clock, Globe, Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';

interface DailyStats {
    date: string;
    sessions: number;
    visitors: number;
    pageViews: number;
}

interface AnalyticsOverview {
    totalSessions: number;
    uniqueVisitors: number;
    totalPageViews: number;
    avgSessionDuration: number;
    avgPagesPerSession: number;
    topPages: { path: string; views: number }[];
    topCountries: { country: string; sessions: number }[];
    deviceBreakdown: { device: string; count: number }[];
    bounceRate: number;
}

interface ActiveSession {
    id: string;
    country?: string;
    city?: string;
    device: string;
    browser?: string;
    pageViewCount: number;
    lastActiveAt: string;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AnalyticsDashboard() {
    const [days, setDays] = useState(7);
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [activeSessions, setActiveSessions] = useState<{ count: number; sessions: ActiveSession[] }>({ count: 0, sessions: [] });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, dailyRes, activeRes] = await Promise.all([
                fetch(`/api/analytics/stats?type=overview&days=${days}`),
                fetch(`/api/analytics/stats?type=daily&days=${days}`),
                fetch('/api/analytics/stats?type=active')
            ]);

            if (overviewRes.ok) setOverview(await overviewRes.json());
            if (dailyRes.ok) setDailyStats(await dailyRes.json());
            if (activeRes.ok) setActiveSessions(await activeRes.json());

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Refresh active sessions every 30 seconds
        const interval = setInterval(async () => {
            const res = await fetch('/api/analytics/stats?type=active');
            if (res.ok) setActiveSessions(await res.json());
        }, 30000);
        return () => clearInterval(interval);
    }, [days]);

    const statCards = overview ? [
        { name: 'Unique Visitors', value: overview.uniqueVisitors, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { name: 'Total Sessions', value: overview.totalSessions, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Page Views', value: overview.totalPageViews, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
        { name: 'Avg. Duration', value: formatDuration(overview.avgSessionDuration), icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    ] : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
                    <p className="text-slate-500 mt-1">
                        Real-time visitor tracking and insights
                        <span className="text-xs text-slate-400 ml-2">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <a
                        href="/admin/analytics/sessions"
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        View All Sessions
                    </a>
                </div>
            </div>

            {/* Active Now Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold text-emerald-700">
                    {activeSessions.count} visitor{activeSessions.count !== 1 ? 's' : ''} online now
                </span>
            </div>

            {/* Stat Cards */}
            {overview && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <div key={stat.name} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visitor Trend Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Visitor Trends</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    labelFormatter={(label) => formatDate(String(label))}
                                />
                                <Line type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} name="Visitors" />
                                <Line type="monotone" dataKey="sessions" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="Sessions" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Devices</h2>
                    <div className="h-64 flex items-center justify-center">
                        {overview && overview.deviceBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overview.deviceBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="device"
                                        label={({ name, percent }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {overview.deviceBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-400 text-sm">No device data yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Top Pages</h2>
                    {overview && overview.topPages.length > 0 ? (
                        <div className="space-y-3">
                            {overview.topPages.slice(0, 8).map((page, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-sm text-slate-700 truncate max-w-[200px]" title={page.path}>
                                        {page.path}
                                    </span>
                                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                        {page.views}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">No page view data yet</p>
                    )}
                </div>

                {/* Top Countries */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Globe size={20} /> Top Countries
                    </h2>
                    {overview && overview.topCountries.length > 0 ? (
                        <div className="space-y-3">
                            {overview.topCountries.slice(0, 8).map((country, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-sm text-slate-700">{country.country}</span>
                                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                        {country.sessions}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">No location data yet</p>
                    )}
                </div>
            </div>

            {/* Additional Stats */}
            {overview && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <p className="text-sm font-medium text-slate-500 mb-1">Bounce Rate</p>
                        <p className="text-3xl font-bold text-slate-900">{overview.bounceRate.toFixed(1)}%</p>
                        <p className="text-xs text-slate-400 mt-1">Single page sessions</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <p className="text-sm font-medium text-slate-500 mb-1">Pages per Session</p>
                        <p className="text-3xl font-bold text-slate-900">{overview.avgPagesPerSession.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-1">Average pages viewed</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <p className="text-sm font-medium text-slate-500 mb-1">Avg. Session Duration</p>
                        <p className="text-3xl font-bold text-slate-900">{formatDuration(overview.avgSessionDuration)}</p>
                        <p className="text-xs text-slate-400 mt-1">Time spent on site</p>
                    </div>
                </div>
            )}

            {/* Active Sessions Table */}
            {activeSessions.sessions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live Visitors
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Location</th>
                                    <th className="px-4 py-3 text-left">Device</th>
                                    <th className="px-4 py-3 text-left">Browser</th>
                                    <th className="px-4 py-3 text-left">Pages</th>
                                    <th className="px-4 py-3 text-left">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeSessions.sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-700">
                                            {session.city ? `${session.city}, ${session.country}` : session.country || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-slate-600">
                                                {session.device === 'mobile' && <Smartphone size={14} />}
                                                {session.device === 'tablet' && <Tablet size={14} />}
                                                {session.device === 'desktop' && <Monitor size={14} />}
                                                {session.device}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{session.browser || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-slate-900 font-medium">{session.pageViewCount}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">
                                            {new Date(session.lastActiveAt).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
