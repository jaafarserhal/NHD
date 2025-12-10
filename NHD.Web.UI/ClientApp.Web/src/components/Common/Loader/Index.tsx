import React from "react";

interface LoaderProps {
    loading: boolean;
}

export default function Loader({ loading }: LoaderProps) {
    if (!loading) return null;

    return (
        <div className="loader-brand">
            <img
                src="/assets/images/logo-black.svg"
                className="loader-logo"
                alt="logo"
            />
            <div className="loader-ring"></div>
        </div>
    );
}
