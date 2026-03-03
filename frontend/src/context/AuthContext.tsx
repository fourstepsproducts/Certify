import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Award, Loader2, Flame } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    activePlan: string;
    billingCycleEnd?: string;
    scheduledPlan?: string;
    canLockLayout?: boolean;
    token: string;
    role?: 'organizer' | 'participant';
    profileCompleted?: boolean;
    organizationName?: string;
    organizationType?: string;
    website?: string;
    phone?: string;
    profession?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            console.log('AuthContext: Initializing...');
            setLoading(true);
            try {
                // 1. Check URL for token (Social Login Redirect)
                const params = new URLSearchParams(window.location.search);
                let urlToken = params.get('token');

                if (!urlToken && window.location.hash) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    urlToken = hashParams.get('token');
                }

                if (urlToken) {
                    console.log('AuthContext: Found token in URL, validating...');
                    try {
                        console.log('AuthContext: Fetching /api/auth/me...');
                        const response = await fetch('/api/auth/me', {
                            headers: { 'Authorization': `Bearer ${urlToken}` }
                        });
                        console.log('AuthContext: /api/auth/me response status:', response.status);

                        if (response.ok) {
                            const userData = await response.json();
                            console.log('AuthContext: /api/auth/me response data received');
                            const fullUser = {
                                ...userData,
                                _id: userData._id || userData.id || 'unknown',
                                token: urlToken
                            };

                            setUser(fullUser);
                            localStorage.setItem('user', JSON.stringify(fullUser));
                            toast.success(`Welcome, ${fullUser.name}!`);
                            console.log('AuthContext: User authenticated from URL:', fullUser.email);

                            // Clean URL
                            console.log('AuthContext: Cleaning URL...');
                            window.history.replaceState({}, document.title, window.location.pathname);
                            setLoading(false);
                            console.log('AuthContext: Initialization complete (token from URL)');
                            return;
                        } else {
                            console.warn('AuthContext: URL token validation failed, response not OK');
                            const errorData = await response.json().catch(() => ({}));
                            console.warn('AuthContext: Error details:', errorData);
                        }
                    } catch (err) {
                        console.error('AuthContext: Error validating URL token:', err);
                    }
                }

                // 2. Fallback to Local Storage
                const storedUserString = localStorage.getItem('user');
                if (storedUserString && storedUserString !== 'undefined' && storedUserString !== 'null') {
                    try {
                        const parsed = JSON.parse(storedUserString);
                        if (parsed && parsed.token) {
                            console.log('AuthContext: Restoring session and syncing with backend...');

                            // Immediately set the stored user to avoid blank UI
                            setUser(parsed);

                            // Re-fetch from backend to get latest data (plan changes, etc)
                            const response = await fetch('/api/auth/me', {
                                headers: { 'Authorization': `Bearer ${parsed.token}` }
                            });

                            if (response.ok) {
                                const userData = await response.json();
                                const updatedUser = {
                                    ...parsed,
                                    ...userData
                                };
                                console.log('AuthContext: Session synced successfully');
                                setUser(updatedUser);
                                localStorage.setItem('user', JSON.stringify(updatedUser));
                            } else if (response.status === 401) {
                                console.warn('AuthContext: Session expired');
                                logout();
                            }
                        } else {
                            localStorage.removeItem('user');
                        }
                    } catch (e) {
                        console.error('AuthContext: Failed to parse stored user');
                        localStorage.removeItem('user');
                    }
                } else {
                    console.log('AuthContext: No session found in storage');
                }
            } catch (error) {
                console.error('AuthContext: Initialization failed:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (userData: User) => {
        console.log('AuthContext: Logging in user:', userData.email);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        console.log('AuthContext: Logging out');
        setUser(null);
        localStorage.removeItem('user');
        window.location.href = '/signin';
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    // Onboarding redirect
    useEffect(() => {
        if (!loading && user && !user.profileCompleted && window.location.pathname !== '/onboarding') {
            const isPublicPage = ['/signin', '/signup', '/verify-email', '/check-status', '/terms', '/privacy', '/cookies', '/refund'].some(path => window.location.pathname.startsWith(path)) || window.location.pathname === '/';

            if (!isPublicPage) {
                console.log('AuthContext: Profile incomplete, redirecting to onboarding...');
                window.location.href = '/onboarding';
            }
        }
    }, [user, loading]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-black gap-6">
                <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        <Flame className="h-16 w-16 text-[#38BDF8] animate-pulse drop-shadow-[0_0_20px_rgba(56,189,248,0.7)]" />
                        <div className="absolute inset-0 rounded-full animate-spin border-y-[3px] border-[#38BDF8] border-x-transparent opacity-70 w-24 h-24 -m-4" style={{ animationDuration: '1.5s' }} />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-3 mt-4 relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Certify<span className="text-[#38BDF8]">Pro</span></h2>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                        <p className="text-[#94A3B8] text-xs font-medium uppercase tracking-widest leading-none">Initializing Workspace</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
