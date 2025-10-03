// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Redirect to login if no token
        return <Navigate to="/auth/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
