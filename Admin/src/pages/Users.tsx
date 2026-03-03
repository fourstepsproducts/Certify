import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { Mail, Calendar, Key, Shield, Search, MoreVertical, Lock as LockIcon, Unlock as UnlockIcon } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role?: string;
    createdAt: string;
    activePlan?: string;
    isVerified: boolean;
    canLockLayout?: boolean;
}

interface UsersProps {
    onLogout: () => void;
}

const UsersPage = ({ onLogout }: UsersProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; userId: string | null }>({
        isOpen: false,
        userId: null
    });
    const [resetting, setResetting] = useState(false);
    const token = localStorage.getItem('adminToken');

    const handleResetPlanRequest = (userId: string) => {
        setConfirmModal({ isOpen: true, userId });
    };

    const handleResetPlan = async () => {
        const userId = confirmModal.userId;
        if (!userId) return;

        setResetting(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/reset-user-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            const result = await response.json();
            if (result.success) {
                // Update local state
                setUsers(users.map(u => u._id === userId ? { ...u, activePlan: 'Free Demo' } : u));
                toast.success('Plan reset successfully');
                setConfirmModal({ isOpen: false, userId: null });
            } else {
                toast.error(result.message || 'Failed to reset plan');
            }
        } catch (error) {
            console.error('Error resetting plan:', error);
            toast.error('Error resetting plan');
        } finally {
            setResetting(false);
        }
    };

    const handleToggleLayoutLock = async (userId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        try {
            const response = await fetch('http://localhost:5000/api/admin/toggle-layout-lock-permission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, canLockLayout: newStatus })
            });

            const result = await response.json();
            if (result.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, canLockLayout: newStatus } : u));
                toast.success(`Permission ${newStatus ? 'granted' : 'revoked'} successfully`);
            } else {
                toast.error(result.message || 'Failed to toggle permission');
            }
        } catch (error) {
            console.error('Error toggling permission:', error);
            toast.error('Error toggling permission');
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) {
                onLogout();
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    onLogout();
                    return;
                }

                const result = await response.json();
                if (result.success) {
                    setUsers(result.data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token, onLogout]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Layout onLogout={onLogout} title="Users Collection">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout onLogout={onLogout} title="Users Collection">
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold">All Registered Users ({users.length})</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-all w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">User Info</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Plan</th>
                                <th className="px-6 py-4 font-medium">Joined Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-gray-300">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${user.isVerified
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {user.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-sm text-gray-300">{user.activePlan || 'Free Demo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleToggleLayoutLock(user._id, !!user.canLockLayout)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1 ${user.canLockLayout
                                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white'
                                                        : 'bg-gray-500/10 text-gray-500 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {user.canLockLayout ? <UnlockIcon className="w-3 h-3" /> : <LockIcon className="w-3 h-3" />}
                                                    {user.canLockLayout ? 'Layout Unlocked' : 'Lock Layout Disabled'}
                                                </button>
                                                <button
                                                    onClick={() => handleResetPlanRequest(user._id)}
                                                    className="px-3 py-1 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    Reset Plan
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Confirm Reset</h3>
                        </div>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Are you sure you want to reset this user's plan to <span className="text-white font-bold">Free Demo</span>?
                            This will clear all billing data and active subscription benefits immediately.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, userId: null })}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
                                disabled={resetting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPlan}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={resetting}
                            >
                                {resetting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : null}
                                {resetting ? 'Resetting...' : 'Yes, Reset Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UsersPage;
