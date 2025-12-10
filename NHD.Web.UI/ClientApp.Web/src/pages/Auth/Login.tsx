import React, { useState } from "react";
import Header from "../../components/Common/Header/Index";
import Footer from "../../components/Common/Footer/Index";
import { useNavigate } from 'react-router';
import { routeUrls } from "../../api/base/routeUrls";

export default function MyAccount() {

    const navigate = useNavigate();


    const handleCreateAccount = () => {
        navigate(routeUrls.register);
    };

    return (
        <>
            <Header />
            <div className="breadcrumb" style={{ backgroundImage: "url(/assets/images/bg/breadcrumb1-bg.jpg)" }}>
            </div>
            <div className="section" style={{ padding: '25px 0' }}>
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

                                    <p className="mb-3">If you have an account, sign in with your email address.</p>
                                    <form>
                                        <div className="row g-4">

                                            <div className="col-12">
                                                <label htmlFor="email">
                                                    Email Address <abbr className="required">*</abbr>
                                                </label>
                                                <input className="form-field" type="email" id="email" />
                                            </div>
                                            <div className="col-12">
                                                <label htmlFor="password">
                                                    Password <abbr className="required">*</abbr>
                                                </label>
                                                <input className="form-field" type="password" id="password" />
                                            </div>
                                            <div className="col-12">
                                                <button className="btn btn-dark btn-primary-hover w-100" type="submit">
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