import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FileText, Users, TrendingUp, Clock } from 'lucide-react';

interface DashboardProps {
    onLogout: () => void;
}

interface Activity {
    id: string;
    type: string;
    user: string;
    time: string;
    status: string;
}

interface StatsData {
    totalUsers: number;
    totalCertificates: number;
    totalRevenue: number;
    onlineUsers: number;
    recentActivities: Activity[];
}

const Dashboard = ({ onLogout }: DashboardProps) => {
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) {
                onLogout();
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/admin/stats', {
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
                    setStatsData(result.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const stats = [
        {
            name: 'Certificates Downloaded',
            value: statsData?.totalCertificates.toString() || '0',
            icon: FileText,
            description: 'Total exports'
        },
        {
            name: 'Active Users',
            value: statsData?.totalUsers.toString() || '0',
            icon: Users,
            description: 'Registered accounts'
        },
        {
            name: 'Total Revenue',
            value: statsData ? `$${statsData.totalRevenue.toLocaleString()}` : '$0',
            icon: TrendingUp,
            description: 'From subscriptions'
        },
    ];

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading && !statsData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <Layout onLogout={onLogout}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="p-6 bg-[#111] border border-white/5 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                                {stat.description}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-400">{stat.name}</h3>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Recent Activities</h3>
                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-all">View all</button>
                </div>
                <div className="divide-y divide-white/5">
                    {statsData?.recentActivities && statsData.recentActivities.length > 0 ? (
                        statsData.recentActivities.map((activity) => (
                            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-500/50" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{activity.type}</p>
                                        <p className="text-xs text-gray-500">By {activity.user}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{formatRelativeTime(activity.time)}</p>
                                    <p className="text-xs text-green-400">{activity.status}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No recent activities found</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
