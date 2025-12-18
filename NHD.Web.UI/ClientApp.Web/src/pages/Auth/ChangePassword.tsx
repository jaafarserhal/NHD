import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert, validatePassword } from "../../api/common/Utils";
import Header from "../../components/Common/Header/Index";
import Footer from "../../components/Common/Footer/Index";
import Loader from "../../components/Common/Loader/Index";
import authService from "../../api/authService";
import { routeUrls } from "../../api/base/routeUrls";

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
                style={{ backgroundImage: "url(/assets/images/bg/breadcrumb1-bg.jpg)" }}
            />
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
                                            <div className="col-12">
                                                <label htmlFor="password">
                                                    New Password <abbr className="required">*</abbr>
                                                </label>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                    disabled={isLoading}
                                                    className="form-field"
                                                    style={errors.password ? { borderColor: "red" } : {}}
                                                />
                                                <span className="text-danger">{errors.password || "\u00A0"}</span>
                                            </div>

                                            <div className="col-12">
                                                <label htmlFor="confirmPassword">
                                                    Confirm Password <abbr className="required">*</abbr>
                                                </label>
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                    disabled={isLoading}
                                                    className="form-field"
                                                    style={errors.confirmPassword ? { borderColor: "red" } : {}}
                                                />
                                                <span className="text-danger">
                                                    {errors.confirmPassword || "\u00A0"}
                                                </span>
                                            </div>

                                            <div className="col-12">
                                                <button
                                                    type="button"
                                                    className="btn btn-dark btn-primary-hover w-100"
                                                    onClick={handleSubmit}
                                                    disabled={isLoading}
                                                >
                                                    Change Password
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
