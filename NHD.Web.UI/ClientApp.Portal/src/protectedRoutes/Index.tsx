// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { storage } from 'src/api/base/storage';


const ProtectedRoute = ({ children }) => {
    const token = storage.get('authToken');

    if (!token) {
        // Redirect to login if no token
        return <Navigate to="/auth/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
