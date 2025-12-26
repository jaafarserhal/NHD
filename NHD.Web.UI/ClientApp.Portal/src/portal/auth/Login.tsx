import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../api/base/apiClient';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { storage } from 'src/api/base/storage';


interface LoginFormData {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    message?: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
    }
}

const Login: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = storage.get('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!isValidEmail(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password.trim()) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        if (error) setError('');

        try {
            const response: LoginResponse = await apiClient.post('/users/login', {
                email: formData.email.trim(),
                password: formData.password
            });

            // Store the JWT token
            storage.set('authToken', response.token);


            // Store user info if needed
            storage.set('user', JSON.stringify(response.user));
            setIsAuthenticated(true);

            // Redirect to dashboard or home page
            navigate('/');

        } catch (err: any) {
            console.error('Login error:', err);

            if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.status === 429) {
                setError('Too many login attempts. Please try again later.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (!err.response) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    if (isAuthenticated) {
        return (
            <div className="login-page">
                <div className="success-container">
                    <div className="success-icon">
                        <div className="success-checkmark">✓</div>
                    </div>
                    <h2 className="success-title">Welcome!</h2>
                    <p className="success-message">You are successfully logged in.</p>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="demo-button"
                    >
                        Back to Login (Demo)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="login-page">
                <div className="login-container">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-icon">
                            <Lock size={24} />
                        </div>
                        <h1 className="login-title">Nawa Home Of Dates</h1>
                        <p className="login-subtitle">Sign in to your account</p>
                    </div>

                    {/* Form */}
                    <div className="login-form">
                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                <p className="error-text">{error}</p>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon-left">
                                    <Mail size={16} />
                                </div>
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
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon-left">
                                    <Lock size={16} />
                                </div>
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
                                    className="form-input password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="password-toggle"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="login-button"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} />
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;