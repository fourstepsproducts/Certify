import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import CertificatesPage from './pages/Certificates';
import { useState } from 'react';
import { Toaster } from 'sonner';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('adminToken');
    });

    const login = (token: string, adminData: any) => {
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={login} />}
                />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard onLogout={logout} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/users"
                    element={isAuthenticated ? <UsersPage onLogout={logout} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/certificates"
                    element={isAuthenticated ? <CertificatesPage onLogout={logout} /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
            <Toaster position="top-right" expand={true} richColors />
        </Router>
    );
}

export default App;
