import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeUrls } from "../../api/base/routeUrls";
import authService from "../../api/authService";

const EmailVerificationComplete: React.FC = () => {
    const { search } = useLocation();
    const navigate = useNavigate();

    const token = new URLSearchParams(search).get("token");

    const [message, setMessage] = useState("Email Verification");
    const [seconds, setSeconds] = useState(3);
    const [isVerified, setIsVerified] = useState(false);

    // --- Verify Token ---
    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                navigate(routeUrls.home);
            }

            try {
                await authService.verifyEmail(token);
                setIsVerified(true);
            } catch (error: any) {
                setMessage(
                    error?.status === 409
                        ? error.data
                        : "An error occurred while verifying your email. Please try again later."
                );
            }
        };

        verifyEmail();
    }, [token]);

    // --- Countdown + Redirect ---
    useEffect(() => {
        if (!isVerified) return;

        const countdown = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        const redirect = setTimeout(() => {
            navigate(routeUrls.login);
        }, 3000);

        return () => {
            clearInterval(countdown);
            clearTimeout(redirect);
        };
    }, [isVerified, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="text-center px-3">

                <img
                    src="/assets/images/icon/email-complete.png"
                    alt="email-verification"
                    className="verification-image"
                />

                <h1 className="mb-3">Email Verification</h1>

                {!isVerified ? (
                    <p className="mb-4">{message}</p>
                ) : (
                    <p className="mb-4">
                        Your email has been verified.<br />
                        Redirecting in <strong>{seconds}</strong> seconds...
                    </p>
                )}

                <Link to={routeUrls.login} className="btn btn-secondary btn-hover-primary">
                    Go to Login Now
                </Link>
            </div>
        </div>
    );
};

export default EmailVerificationComplete;
