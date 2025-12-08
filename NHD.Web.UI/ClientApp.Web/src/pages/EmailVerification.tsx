import React from "react";
import { Link, useLocation } from "react-router-dom";
import { decryptParameter } from "../api/common/Utils";

const EmailVerification: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const encrypted = params.get("token");
    let email = "";

    if (encrypted) {
        email = decryptParameter(encrypted);
    }

    console.log("Decrypted email:", email);
    return (
        <div className="error">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <div className="error-image">
                            <img src="/assets/images/bg/envelop.jpg" alt="verification-image" />
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="error-content">
                            <h1 className="error-content__title">Verify Your Email !!</h1>
                            <p className="error-content__text"> We’ve sent a verification link to your email address.
                                Please check your inbox and click the link to activate your account.</p>
                            <Link to="/" className="btn btn-secondary btn-hover-primary">
                                Go to Home
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
