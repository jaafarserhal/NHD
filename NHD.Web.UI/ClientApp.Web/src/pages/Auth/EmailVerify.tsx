import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { decryptParameter, showAlert } from "../../api/common/Utils";
import { routeUrls } from "../../api/base/routeUrls";
import authService from "../../api/authService";
import Loader from "../../components/Common/Loader/Index";

const EmailVerificationPending: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const params = new URLSearchParams(location.search);
    const encrypted = params.get("token");
    if (!encrypted) {
        navigate(routeUrls.home);
    }
    let email = "";

    if (encrypted) {
        email = decryptParameter(encrypted);
    }

    const handleResendVerification = () => {
        // Call the API to resend the verification email
        try {
            setLoading(true);
            authService.resendVerificationEmail(email)
                .then(() => {
                    setLoading(false);
                    showAlert("success", "Verification email resent. Please check your inbox.");
                })
                .catch((error) => {
                    console.error("Error resending verification email:", error);
                    setLoading(false);
                    showAlert("error", "Failed to resend verification email. Please try again later.");
                });
        } catch (error) {
            console.error("Unexpected error:", error);
            setLoading(false);
            showAlert("error", "An unexpected error occurred. Please try again later.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Loader loading={loading} />
            <div className="text-center px-3">
                <img
                    src="/assets/images/icon/email-pending.png"
                    alt="verification-image"
                    className="verification-image"
                />
                <h1 className="mb-3">Verify Your Email</h1>
                <p className="mb-4">
                    We’ve sent a verification link to your email address.<br />
                    Please check your inbox and click the link to activate your account.
                </p>
                <p className="d-block mb-4">
                    Didn’t receive the email? <button onClick={handleResendVerification} style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                        <strong>Resend verification</strong>
                    </button>
                </p>
                <Link to="/" className="btn btn-secondary btn-hover-primary">
                    Go to Home
                </Link>

            </div>
        </div>
    );
};

export default EmailVerificationPending;
