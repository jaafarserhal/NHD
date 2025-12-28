import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert, validatePassword } from "../../api/common/Utils";
import Header from "../../components/Common/Header/Index";
import Footer from "../../components/Common/Footer/Index";
import Loader from "../../components/Common/Loader/Index";
import authService from "../../api/authService";
import { routeUrls } from "../../api/base/routeUrls";
import FormField from "../../components/Common/FormField/Index";

const ChangePassword: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const [imageLoaded, setImageLoaded] = useState(false);

    // Preload the banner image for better performance
    useEffect(() => {
        const img = new Image();
        img.src = '/assets/images/banner/auth-banner.webp';
        img.onload = () => setImageLoaded(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Token validation (no side effects here)
        if (!token) {
            newErrors["token"] = "Invalid or expired reset link.";
        }

        // Password validation
        if (!formData.password.trim()) {
            newErrors["password"] = "Password is required";
        } else {
            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                newErrors["password"] = passwordError;
            }
        }

        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors["confirmPassword"] = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors["confirmPassword"] = "Passwords do not match";
        }

        // Apply errors
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async () => {
        if (!validate()) {
            if (!token) {
                showAlert("error", "Invalid or expired reset link.");
            }
            return;
        }

        setIsLoading(true);

        const resetData = {
            token,
            password: formData.password
        };

        await authService
            .resetPassword(resetData)
            .then((response) => {
                setIsLoading(false);
                showAlert("success", "Your password has been reset successfully.");
                setTimeout(() => {
                    navigate(routeUrls.login);
                }, 2000);

            })
            .catch((error) => {
                setIsLoading(false);
                showAlert(
                    "error",
                    error.data ||
                    "An error occurred while resetting the password."
                );
            });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isLoading) {
            handleSubmit();
        }
    };

    return (
        <>
            <Header />
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: "url(/assets/images/banner/auth-banner.webp)",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: imageLoaded ? 1 : 0.9,
                    transition: 'opacity 0.3s ease-in-out'
                }}
            >
            </div>
            <div className="section" style={{ padding: "25px 0", position: "relative" }}>
                <Loader loading={isLoading} isDark={true} fullscreen={false} />
                <div className="container custom-container">
                    <h2 className="mb-4">Change Password</h2>

                    <div className="row g-6">
                        <div className="col-lg-6 col-12">
                            <div className="myaccount-content account-details">
                                <div className="account-details-form">
                                    <form>
                                        <div className="row g-4">

                                            <FormField
                                                label="New Password"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                error={errors.password}
                                                onChange={handleInputChange}
                                                required
                                            />

                                            <FormField
                                                label="Confirm Password"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                error={errors.confirmPassword}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <div className="col-12 mt-3 d-flex gap-2">
                                                <button
                                                    className="btn btn-dark btn-primary-hover flex-fill"
                                                    type="button"
                                                    onClick={handleSubmit}
                                                >
                                                    Change Password
                                                </button>
                                                <button
                                                    className="btn btn-outline-dark flex-fill"
                                                    type="button"
                                                    onClick={() => navigate(routeUrls.login)}
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer isDark={true} />
        </>
    );
};

export default ChangePassword;
