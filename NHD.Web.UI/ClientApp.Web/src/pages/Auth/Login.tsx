import React, { useEffect, useState } from "react";
import Header from "../../components/Common/Header/Index";
import Footer from "../../components/Common/Footer/Index";
import { useNavigate } from 'react-router';
import { routeUrls } from "../../api/base/routeUrls";
import apiClient from '../../api/base/apiClient';
import { LoginRequest, LoginResponse } from "../../api/common/Types";
import Loader from "../../components/Common/Loader/Index";
import { apiUrls } from "../../api/base/apiUrls";
import { showAlert, validateEmail } from "../../api/common/Utils";


export default function Login() {

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateLogin = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email.trim()) {
            newErrors['email'] = "Email address is required";
        } else if (!validateEmail(formData.email)) {
            newErrors['email'] = "Please enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors['password'] = "Password is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        return true;
    };


    const handleSubmit = async () => {
        if (!validateLogin()) return;

        setIsLoading(true);

        try {
            const response: LoginResponse = await apiClient.post(apiUrls.loginCustomer, {
                email: formData.email.trim(),
                password: formData.password
            });

            // Store the JWT token
            localStorage.setItem('authToken', response.token);

        } catch (err: any) {
            console.error('Login error:', err);

            if (err.response?.status === 401) {
                showAlert("error", "Invalid email or password");
            } else if (err.response?.status === 429) {
                showAlert("error", "Too many login attempts. Please try again later.");
            } else if (err.response?.data?.message) {
                showAlert("error", err.response.data.message);
            } else if (!err.response) {
                showAlert("error", 'Network error. Please check your connection and try again.');
            } else {
                showAlert("error", 'Login failed. Please try again.');
            }
        } finally {
            setTimeout(() => {
                setIsLoading(false);
                navigate(routeUrls.myAccount);
            }, 3000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };


    const handleCreateAccount = () => {
        navigate(routeUrls.register);
    };

    return (
        <>
            <Header />
            <div className="breadcrumb" style={{ backgroundImage: "url(/assets/images/bg/breadcrumb1-bg.jpg)" }}>
            </div>
            <div className="section" style={{ padding: '25px 0', position: 'relative' }}>
                <Loader loading={isLoading} isDark={true} fullscreen={false} />
                <div className="container custom-container">
                    <h2 className="mb-5">Customer Login</h2>
                    <div className="row g-6">

                        <div className="col-lg-6 col-12">
                            <h6 className="underlined-header-title">Registered Customers</h6>
                            <div className="myaccount-content account-details">

                                <div className="account-details-form" style={{ marginBottom: '30px' }}>
                                    <p className="social-text"><strong>Login with your social account</strong></p>
                                    <div className="login-group">
                                        <button className="login-btn apple">Login with Apple</button>
                                        <button className="login-btn google">Login with Google</button>
                                    </div>

                                    <div className="login-separator">
                                        <div className="login-separator-line" />
                                        <span className="login-separator-text">or</span>
                                        <div className="login-separator-line" />
                                    </div>

                                    <h6 className="mb-5">If you have an account, sign in with your email address.</h6>
                                    <form>
                                        <div className="row g-4">
                                            <div className="col-12 mt-1">
                                                <label htmlFor="email">
                                                    Email Address <abbr className="required">*</abbr>
                                                </label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Enter your email"
                                                    disabled={isLoading}
                                                    className="form-field"
                                                    style={errors['email'] ? { borderColor: 'red' } : {}}
                                                />
                                            </div>
                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                {errors['email'] || '\u00A0'}
                                            </span>
                                            <div className="col-12 mt-1">
                                                <label htmlFor="password">
                                                    Password <abbr className="required">*</abbr>
                                                </label>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="current-password"
                                                    required
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Enter your password"
                                                    disabled={isLoading}
                                                    className="form-field"
                                                    style={errors['password'] ? { borderColor: 'red' } : {}}
                                                />
                                                <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                    {errors['password'] || '\u00A0'}
                                                </span>
                                            </div>
                                            <div className="col-12">
                                                <button className="btn btn-dark btn-primary-hover w-100" type="button" onClick={handleSubmit} disabled={isLoading}>
                                                    LOGIN
                                                </button>
                                                <div className="forgot-password-link">
                                                    <a href="#"><span>Forgot Your Password?</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-12">
                            <h6 className="underlined-header-title">New Customers</h6>
                            <div className="myaccount-content account-details">
                                <div className="account-details-form">
                                    <p className="mb-4">Creating an account has many benefits: check out faster, keep more than one address, track orders and more.</p>

                                    <button
                                        className="btn btn-dark btn-primary-hover w-100"
                                        type="button"
                                        onClick={handleCreateAccount}
                                        style={{ backgroundColor: '#c9a86a', border: 'none' }}
                                    >
                                        CREATE AN ACCOUNT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer isDark={true} />
        </>
    );
}