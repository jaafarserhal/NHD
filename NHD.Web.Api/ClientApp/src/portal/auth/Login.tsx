import React, { useState, useEffect } from 'react';
import apiClient from '../../api/base/apiClient'; // Adjust import path as needed
import './login.css'; // Import your CSS styles

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

    // Check if user is already authenticated on component mount
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
        setError('');

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
            window.location.href = '/';

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

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setFormData({ email: '', password: '' });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    // If already authenticated, show logout option
    //   if (isAuthenticated) {
    //     const user = localStorage.getItem('user');
    //     return (
    //       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
    //         <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
    //           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
    //             <span className="text-3xl text-green-600">✅</span>
    //           </div>
    //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
    //           <p className="text-gray-600 mb-6">
    //             You're logged in as <span className="font-semibold">{user}</span>
    //           </p>
    //           <div className="space-y-4">
    //             <button
    //               onClick={() => window.location.href = '/dashboard'}
    //               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
    //             >
    //               Go to Dashboard
    //             </button>
    //             <button
    //               onClick={handleLogout}
    //               className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
    //             >
    //               Logout
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     );
    //   }

    //   return (
    //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
    //       <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
    //         <div className="text-center mb-8">
    //           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
    //             <span className="text-3xl text-blue-600">🔐</span>
    //           </div>
    //           <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
    //           <p className="text-gray-600 mb-6">Please sign in to your account</p>
    //         </div>

    //         <div className="space-y-6">
    //           {/* Email Field */}
    //           <div>
    //             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
    //               Email Address
    //             </label>
    //             <div className="relative">
    //               <input
    //                 id="email"
    //                 name="email"
    //                 type="email"
    //                 autoComplete="email"
    //                 required
    //                 value={formData.email}
    //                 onChange={handleInputChange}
    //                 onKeyDown={handleKeyDown}
    //                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
    //                 placeholder="Enter your email"
    //                 disabled={isLoading}
    //               />
    //             </div>
    //           </div>

    //           {/* Password Field */}
    //           <div>
    //             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
    //               Password
    //             </label>
    //             <div className="relative">
    //               <input
    //                 id="password"
    //                 name="password"
    //                 type={showPassword ? 'text' : 'password'}
    //                 autoComplete="current-password"
    //                 required
    //                 value={formData.password}
    //                 onChange={handleInputChange}
    //                 onKeyDown={handleKeyDown}
    //                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
    //                 placeholder="Enter your password"
    //                 disabled={isLoading}
    //               />
    //               <button
    //                 type="button"
    //                 onClick={() => setShowPassword(!showPassword)}
    //                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
    //                 disabled={isLoading}
    //               >
    //                 <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
    //               </button>
    //             </div>
    //           </div>

    //           {/* Error Message */}
    //           {error && (
    //             <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
    //               <span className="text-red-500">⚠️</span>
    //               <span className="text-sm">{error}</span>
    //             </div>
    //           )}

    //           {/* Submit Button */}
    //           <button
    //             type="button"
    //             onClick={handleSubmit}
    //             disabled={isLoading}
    //             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
    //           >
    //             {isLoading ? (
    //               <>
    //                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    //                 <span>Signing In...</span>
    //               </>
    //             ) : (
    //               <span>Sign In</span>
    //             )}
    //           </button>
    //         </div>

    //         {/* Additional Links */}
    //         <div className="mt-6 text-center space-y-2">
    //           <a
    //             href="/forgot-password"
    //             className="text-sm text-blue-600 hover:text-blue-800 transition duration-200"
    //           >
    //             Forgot your password?
    //           </a>
    //           <div className="text-sm text-gray-600">
    //             Don't have an account?{' '}
    //             <a
    //               href="/register"
    //               className="text-blue-600 hover:text-blue-800 font-medium transition duration-200"
    //             >
    //               Sign up
    //             </a>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   );
    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
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
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type={'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your password"
                        disabled={isLoading}
                    />
                </div>
                {/* Submit Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Signing In...</span>
                        </>
                    ) : (
                        <span>Sign In</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Login;
