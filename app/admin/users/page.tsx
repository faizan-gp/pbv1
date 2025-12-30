import { getAllUsers } from "@/lib/firestore/users";
import { Users, Shield, ShieldAlert } from 'lucide-react';

async function getUsers() {
    const users = await getAllUsers();
    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Manage user accounts and roles.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Email</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Role</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {users.map((user: any) => (
                            <tr key={user.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                                    <div className="flex items-center gap-3">
                                        {user.image ? (
                                            <img src={user.image} alt="" className="h-8 w-8 rounded-full" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                {user.name?.[0].toUpperCase()}
                                            </div>
                                        )}
                                        {user.name}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                    {user.email}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.role === 'admin'
                                        ? 'bg-purple-50 text-purple-700 ring-purple-600/20'
                                        : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                                        }`}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
