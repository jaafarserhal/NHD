import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../api/base/apiClient';
import { useNavigate } from 'react-router-dom';

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
        const token = localStorage.getItem('authToken');
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
            localStorage.setItem('authToken', response.token);


            // Store user info if needed
            localStorage.setItem('user', JSON.stringify(response.user));

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
            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f9fafb;
                    padding: 1rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }

                .login-container {
                    max-width: 400px;
                    width: 100%;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                }

                .login-header {
                    background: #2563eb;
                    padding: 2rem 1.5rem;
                    text-align: center;
                    color: white;
                }

                .login-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }

                .login-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem;
                }

                .login-subtitle {
                    color: #bfdbfe;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .login-form {
                    padding: 1.5rem;
                }

                .demo-info {
                    margin-bottom: 1rem;
                    padding: 0.75rem;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 6px;
                }

                .demo-info-title {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #1e40af;
                    margin: 0 0 0.25rem;
                }

                .demo-info-text {
                    font-size: 0.75rem;
                    color: #2563eb;
                    margin: 0;
                }

                .error-message {
                    margin-bottom: 1rem;
                    padding: 0.75rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 6px;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }

                .error-message svg {
                    color: #ef4444;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .error-text {
                    font-size: 0.875rem;
                    color: #b91c1c;
                    margin: 0;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 0.25rem;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon-left {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    pointer-events: none;
                }

                .form-input {
                    width: 100%;
                    padding: 0.5rem 0.75rem 0.5rem 2.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .form-input:disabled {
                    background-color: #f3f4f6;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .password-input {
                    padding-right: 2.5rem;
                }

                .password-toggle {
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                }

                .password-toggle:hover {
                    color: #6b7280;
                }

                .password-toggle:disabled {
                    cursor: not-allowed;
                }

                .forgot-password {
                    text-align: right;
                    margin-bottom: 1.5rem;
                }

                .forgot-link {
                    font-size: 0.875rem;
                    color: #2563eb;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    text-decoration: none;
                }

                .forgot-link:hover {
                    color: #1d4ed8;
                }

                .login-button {
                    width: 100%;
                    padding: 0.5rem 1rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                .login-button:hover:not(:disabled) {
                    background: #1d4ed8;
                }

                .login-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .login-button svg {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .signup-link {
                    text-align: center;
                }

                .signup-text {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin: 0;
                }

                .signup-button {
                    color: #2563eb;
                    background: none;
                    border: none;
                    font-weight: 500;
                    cursor: pointer;
                    text-decoration: none;
                }

                .signup-button:hover {
                    color: #1d4ed8;
                }

                .success-container {
                    max-width: 400px;
                    width: 100%;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    padding: 2rem;
                    text-align: center;
                }

                .success-icon {
                    width: 64px;
                    height: 64px;
                    background: #dcfce7;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }

                .success-checkmark {
                    width: 32px;
                    height: 32px;
                    background: #22c55e;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    font-weight: bold;
                }

                .success-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 0.5rem;
                }

                .success-message {
                    color: #6b7280;
                    margin: 0 0 1.5rem;
                }

                .demo-button {
                    width: 100%;
                    padding: 0.5rem 1rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .demo-button:hover {
                    background: #1d4ed8;
                }
            `}</style>

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