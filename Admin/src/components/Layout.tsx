import { ReactNode } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
    onLogout: () => void;
    title?: string;
}

const Layout = ({ children, onLogout, title = 'Overview' }: LayoutProps) => {
    const location = useLocation();
    const adminName = JSON.parse(localStorage.getItem('adminData') || '{}').name || 'Admin';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <div className="hidden lg:flex w-64 border-r border-white/5 bg-[#0d0d0d] flex-col fixed h-full z-30">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">CertifyPro Admin</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === '/dashboard' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link to="/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === '/users' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Users className="w-5 h-5" />
                        Users Collection
                    </Link>
                    <Link to="/certificates" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === '/certificates' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <FileText className="w-5 h-5" />
                        Certificates Collection
                    </Link>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                        <Settings className="w-5 h-5" />
                        Settings
                    </a>
                </nav>
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-64 min-w-0 relative max-w-full">
                <header className="h-16 border-b border-white/5 bg-[#0d0d0d] px-8 flex items-center justify-between sticky top-0 z-10 min-w-0">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            Welcome back, <span className="text-white font-medium">{adminName}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                            {adminName.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-8 space-y-8 overflow-x-hidden overflow-y-auto min-h-[calc(100vh-64px)] min-w-0 max-w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
