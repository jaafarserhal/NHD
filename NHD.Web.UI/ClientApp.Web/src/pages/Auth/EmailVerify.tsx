import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { decryptParameter } from "../../api/common/Utils";
import { routeUrls } from "../../api/base/routeUrls";

const EmailVerificationPending: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const encrypted = params.get("token");
    if (!encrypted) {
        navigate(routeUrls.home);
    }
    let email = "";

    if (encrypted) {
        email = decryptParameter(encrypted);
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
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

                <Link to="/" className="btn btn-secondary btn-hover-primary">
                    Go to Home
                </Link>
            </div>
        </div>
    );
};

export default EmailVerificationPending;
