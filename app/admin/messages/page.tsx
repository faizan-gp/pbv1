'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mail, Clock, CheckCircle, Circle, Trash2, Tag, Loader2 } from 'lucide-react';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    topic: string;
    orderId?: string;
    message: string;
    status: 'read' | 'unread';
    timestamp: Timestamp;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'contact_messages'), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ContactMessage[];
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleStatus = async (id: string, currentStatus: 'read' | 'unread') => {
        const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
        const docRef = doc(db, 'contact_messages', id);
        await updateDoc(docRef, { status: newStatus });
    };

    const deleteMessage = async (id: string) => {
        if (confirm('Are you sure you want to delete this message?')) {
            await deleteDoc(doc(db, 'contact_messages', id));
        }
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'Just now';
        return new Date(timestamp.seconds * 1000).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Messages</h1>
                    <p className="text-slate-500">View and manage customer inquiries.</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                    {messages.length} Total Messages
                </div>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No messages yet</h3>
                        <p className="text-slate-500">New inquiries will appear here.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`group relative flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-2xl border transition-all ${msg.status === 'unread'
                                    ? 'border-indigo-100 shadow-md shadow-indigo-500/5'
                                    : 'border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            {/* Status Indicator */}
                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                <button
                                    onClick={() => toggleStatus(msg.id, msg.status)}
                                    className={`p-1.5 rounded-full transition-colors ${msg.status === 'unread'
                                            ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                    title={msg.status === 'unread' ? 'Mark as read' : 'Mark as unread'}
                                >
                                    {msg.status === 'unread' ? <Circle size={16} fill="currentColor" /> : <CheckCircle size={16} />}
                                </button>
                                <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="p-1.5 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Delete message"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${msg.status === 'unread' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {msg.status === 'unread' ? 'New' : 'Read'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                        <Tag size={12} />
                                        {msg.topic}
                                    </span>
                                    {msg.orderId && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                            Order #{msg.orderId}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto sm:ml-0">
                                        <Clock size={12} />
                                        {formatDate(msg.timestamp)}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900">{msg.name}</span>
                                        <span className="text-slate-400 text-sm">&lt;{msg.email}&gt;</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
