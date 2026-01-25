'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Monitor, Smartphone, Tablet, Globe, Clock, Eye, ExternalLink, ChevronRight, User, MapPin, Laptop } from 'lucide-react';
import Link from 'next/link';

interface Session {
    id: string;
    visitorId: string;
    userId?: string;
    startedAt: string;
    lastActiveAt: string;
    endedAt?: string;
    duration: number;
    country?: string;
    city?: string;
    device: string;
    browser?: string;
    os?: string;
    pageViewCount: number;
    referrer?: string;
    isBot: boolean;
}

interface PageView {
    id: string;
    path: string;
    title?: string;
    timestamp: string;
    timeOnPage?: number;
    scrollDepth?: number;
}

interface SessionDetail {
    session: Session & {
        countryCode?: string;
        region?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
    };
    pageViews: PageView[];
}

function formatDuration(seconds: number): string {
    if (!seconds) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function DeviceIcon({ device }: { device: string }) {
    switch (device) {
        case 'mobile': return <Smartphone size={16} className="text-slate-500" />;
        case 'tablet': return <Tablet size={16} className="text-slate-500" />;
        default: return <Monitor size={16} className="text-slate-500" />;
    }
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/analytics/stats?type=recent&limit=100');
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
        setLoading(false);
    };

    const viewSessionDetail = async (sessionId: string) => {
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/analytics/session/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedSession(data);
            }
        } catch (error) {
            console.error('Failed to fetch session detail:', error);
        }
        setDetailLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/analytics" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Visitor Sessions</h1>
                    <p className="text-slate-500 text-sm">View all visitor sessions and their activity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sessions List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-900">All Sessions</h2>
                        <p className="text-xs text-slate-500">{sessions.length} sessions</p>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400">Loading sessions...</div>
                        ) : sessions.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <User size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No sessions recorded yet</p>
                                <p className="text-xs mt-1">Sessions will appear as visitors browse your site</p>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => viewSessionDetail(session.id)}
                                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-4 ${selectedSession?.session.id === session.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DeviceIcon device={session.device} />
                                            <span className="text-sm font-medium text-slate-900 truncate">
                                                {session.city ? `${session.city}, ${session.country}` : session.country || 'Unknown'}
                                            </span>
                                            {session.isBot && (
                                                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Bot</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span>{session.browser}</span>
                                            <span>•</span>
                                            <span>{session.pageViewCount} pages</span>
                                            <span>•</span>
                                            <span>{formatDuration(session.duration)}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {formatDateTime(session.startedAt)}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Session Detail */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {detailLoading ? (
                        <div className="p-8 text-center text-slate-400">Loading session details...</div>
                    ) : selectedSession ? (
                        <>
                            {/* Session Info Header */}
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <User size={18} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Session Details</h3>
                                        <p className="text-xs text-slate-500 font-mono">{selectedSession.session.visitorId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Session Metadata */}
                            <div className="p-4 border-b border-slate-100 grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span className="text-slate-600">
                                        {selectedSession.session.city}, {selectedSession.session.region}, {selectedSession.session.country}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Laptop size={14} className="text-slate-400" />
                                    <span className="text-slate-600">
                                        {selectedSession.session.browser} / {selectedSession.session.os}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-slate-600">
                                        {formatDuration(selectedSession.session.duration)} total
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye size={14} className="text-slate-400" />
                                    <span className="text-slate-600">
                                        {selectedSession.pageViews.length} pages viewed
                                    </span>
                                </div>
                                {selectedSession.session.referrer && (
                                    <div className="col-span-2 flex items-center gap-2">
                                        <ExternalLink size={14} className="text-slate-400" />
                                        <span className="text-slate-600 truncate">
                                            From: {selectedSession.session.referrer}
                                        </span>
                                    </div>
                                )}
                                {selectedSession.session.utmSource && (
                                    <div className="col-span-2 flex items-center gap-2">
                                        <Globe size={14} className="text-slate-400" />
                                        <span className="text-slate-600">
                                            Campaign: {selectedSession.session.utmSource} / {selectedSession.session.utmMedium} / {selectedSession.session.utmCampaign}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Page Views Timeline */}
                            <div className="p-4">
                                <h4 className="font-bold text-slate-900 mb-3">User Journey</h4>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {selectedSession.pageViews.map((pv, index) => (
                                        <div key={pv.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                                {index < selectedSession.pageViews.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-3">
                                                <div className="text-sm font-medium text-slate-900 truncate" title={pv.path}>
                                                    {pv.path}
                                                </div>
                                                {pv.title && (
                                                    <div className="text-xs text-slate-500 truncate">{pv.title}</div>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <span>{formatTime(pv.timestamp)}</span>
                                                    {pv.timeOnPage && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{formatDuration(pv.timeOnPage)}</span>
                                                        </>
                                                    )}
                                                    {typeof pv.scrollDepth === 'number' && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="inline-block w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                    <span
                                                                        className="block h-full bg-indigo-500 rounded-full"
                                                                        style={{ width: `${Math.min(pv.scrollDepth, 100)}%` }}
                                                                    />
                                                                </span>
                                                                <span>{Math.round(pv.scrollDepth)}%</span>
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <Eye size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Select a session to view details</p>
                            <p className="text-xs mt-1">Click on any session to see the user's journey</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
