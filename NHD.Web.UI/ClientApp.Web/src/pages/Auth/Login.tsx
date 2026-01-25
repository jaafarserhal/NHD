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
import { storage } from "../../api/base/storage";
import { AppleSignInManager, AppleSignInResponse } from "../../api/common/AppleSignIn";
import { GoogleSignInManager, GoogleSignInResponse, GoogleUserInfo } from "../../api/common/GoogleSignIn";
import { useCart } from "../../contexts/CartContext";


export default function Login() {

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();
    const { syncCartOnLogin } = useCart();


    // Preload the banner image for better performance
    useEffect(() => {
        const img = new Image();
        img.src = '/assets/images/banner/auth-banner.webp';
        img.onload = () => setImageLoaded(true);

        // Initialize Google Sign-In
        const initGoogle = async () => {
            await initializeGoogleSignIn();

            // Render the button after initialization
            setTimeout(() => {
                const buttonDiv = document.getElementById('google-signin-button');
                if (buttonDiv) {
                    GoogleSignInManager.renderButton(buttonDiv, {
                        theme: 'outline',
                        size: 'large',
                        text: 'signin_with',
                        width: 280
                    });
                }
            }, 100);
        };

        initGoogle();
    }, []);

    const initializeAppleSignIn = async () => {
        try {
            await AppleSignInManager.initialize({
                clientId: process.env.REACT_APP_APPLE_CLIENT_ID || 'com.nawa.service-id',
                scope: 'name email',
                redirectURI: process.env.REACT_APP_APPLE_REDIRECT_URI || `${window.location.origin}/auth/apple/callback`,
                state: AppleSignInManager.generateRandomString(16),
                nonce: AppleSignInManager.generateRandomString(32),
                usePopup: true
            });
        } catch (error) {
            console.error('Failed to initialize Apple Sign-In:', error);
        }
    };

    const initializeGoogleSignIn = async () => {
        try {
            await GoogleSignInManager.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
                callback: handleGoogleResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: false  // Disable FedCM to prevent AbortError
            });
        } catch (error) {
            console.error('Failed to initialize Google Sign-In:', error);
        }
    };

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
            storage.set('webAuthToken', response.token);

            // Extract user ID from token and sync cart
            const token = response.token;
            if (token) {
                try {
                    await syncCartOnLogin();
                } catch (cartError) {
                    console.error('Error syncing cart on login:', cartError);
                    // Don't block login if cart sync fails
                }
            }

            setTimeout(() => {
                setIsLoading(false);
                navigate(routeUrls.myAccount);
            }, 1000);

        } catch (err: any) {
            var message = err.message
            if (err.response?.status === 401) {
                message = err.response.data.message;
            } else if (err.response?.status === 429) {
                message = "Too many login attempts. Please try again later.";
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (!err.response) {
                message = "Network error. Please check your internet connection.";
            } else {
                message = err.response.data.message || "An unexpected error occurred. Please try again.";
            }
            setTimeout(() => {
                setIsLoading(false);
                showAlert("error", message);
            }, 1000);
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

    const handleGoogleResponse = async (response: GoogleSignInResponse) => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            console.log('Google Sign-In response received:', response);

            // Parse the JWT token to get user info
            const userInfo: GoogleUserInfo = GoogleSignInManager.parseJWT(response.credential);
            console.log('Parsed user info:', userInfo);

            // Prepare data for backend
            const googleLoginData = {
                idToken: response.credential,
                accessToken: '', // Not provided in credential response
                firstName: userInfo.given_name || '',
                lastName: userInfo.family_name || '',
                email: userInfo.email,
                providerId: userInfo.sub, // Google user ID
                picture: userInfo.picture || ''
            };

            console.log('Sending to backend:', { ...googleLoginData, idToken: '[REDACTED]' });

            // Send to backend for verification and login
            const loginResponse: LoginResponse = await apiClient.post(apiUrls.loginWithGoogle, googleLoginData);

            // Store the JWT token
            storage.set('webAuthToken', loginResponse.token);

            // Extract user ID from token and sync cart
            const token = loginResponse.token;
            if (token) {
                try {
                    await syncCartOnLogin();
                } catch (cartError) {
                    console.error('Error syncing cart on Google login:', cartError);
                    // Don't block login if cart sync fails
                }
            }

            setTimeout(() => {
                setIsLoading(false);
                navigate(routeUrls.myAccount);
            }, 1000);

        } catch (err: any) {
            console.error('Google Sign-In error:', err);
            let message = "Google Sign-In failed. Please try again.";

            if (err.response?.status === 401) {
                message = err.response.data.message || "Google authentication failed";
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            }

            setTimeout(() => {
                setIsLoading(false);
                showAlert("error", message);
            }, 1000);
        }
    };

    const handleGoogleSignIn = async () => {
        if (isLoading) return;

        try {
            await GoogleSignInManager.promptWithErrorHandling();
        } catch (error) {
            console.error('Google Sign-In prompt error:', error);
            showAlert("error", "Google Sign-In is currently unavailable. Please try again later or use email login.");
        }
    };

    const handleAppleSignIn = async () => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const response: AppleSignInResponse = await AppleSignInManager.signIn();

            // Extract user information from Apple response
            const appleLoginData = {
                identityToken: response.authorization.id_token,
                authCode: response.authorization.code,
                firstName: response.user?.name?.firstName || '',
                lastName: response.user?.name?.lastName || '',
                email: response.user?.email || '',
                providerId: '' // This will be extracted from the JWT token on the backend
            };

            // Send to backend for verification and login
            const loginResponse: LoginResponse = await apiClient.post(apiUrls.loginWithApple, appleLoginData);

            // Store the JWT token
            storage.set('webAuthToken', loginResponse.token);

            // Extract user ID from token and sync cart
            const token = loginResponse.token;
            if (token) {
                try {
                    await syncCartOnLogin();
                } catch (cartError) {
                    console.error('Error syncing cart on Apple login:', cartError);
                    // Don't block login if cart sync fails
                }
            }

            setTimeout(() => {
                setIsLoading(false);
                navigate(routeUrls.myAccount);
            }, 1000);

        } catch (err: any) {
            console.error('Apple Sign-In error:', err);
            let message = "Apple Sign-In failed. Please try again.";

            if (err.response?.status === 401) {
                message = err.response.data.message || "Apple authentication failed";
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.error === 'popup_closed_by_user') {
                // User cancelled the popup - don't show error
                setIsLoading(false);
                return;
            }

            setTimeout(() => {
                setIsLoading(false);
                showAlert("error", message);
            }, 1000);
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
                                        {/* <button
                                            className="login-btn apple"
                                            type="button"
                                            onClick={handleAppleSignIn}
                                            disabled={isLoading}
                                        >
                                            Login with Apple
                                        </button> */}
                                        <div id="google-signin-button"></div>
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
                                                <div style={{ position: 'relative' }}>
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
                                                        style={errors['password'] ? { borderColor: 'red', paddingRight: '45px' } : { paddingRight: '45px' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isLoading}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '12px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#666',
                                                            opacity: isLoading ? 0.5 : 1
                                                        }}
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                    >
                                                        {showPassword ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                <circle cx="12" cy="12" r="3"></circle>
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                                <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                    {errors['password'] || '\u00A0'}
                                                </span>
                                            </div>
                                            <div className="col-12">
                                                <button className="btn btn-dark btn-primary-hover w-100" type="button" onClick={handleSubmit} disabled={isLoading}>
                                                    LOGIN
                                                </button>
                                                <div className="forgot-password-link">
                                                    <a href={routeUrls.forgotPassword}><span>Forgot Your Password?</span>
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