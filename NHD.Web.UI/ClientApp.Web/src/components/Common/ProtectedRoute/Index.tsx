import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import { routeUrls } from "../../../api/base/routeUrls";
import { storage } from "../../../api/base/storage";

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = storage.get("webAuthToken");

    if (!token) {
        return <Navigate to={routeUrls.login} replace />;
    }

    return children;
};

export default ProtectedRoute;
