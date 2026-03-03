import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const DashboardRedirect = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/signin');
                return;
            }

            if (user?.role === 'organizer') {
                navigate('/organizer/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        }
    }, [user, isAuthenticated, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
};

export default DashboardRedirect;
