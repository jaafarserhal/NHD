import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { decryptParameter, showAlert, validateEmail } from "../../api/common/Utils";
import { routeUrls } from "../../api/base/routeUrls";
import Header from "../../components/Common/Header/Index";
import Footer from "../../components/Common/Footer/Index";
import Loader from "../../components/Common/Loader/Index";
import authService from "../../api/authService";

const ForgotPassword: React.FC = () => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<any>({
        email: '',
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };
    const validate = async () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email.trim()) {
            newErrors['email'] = "Email address is required";
        } else if (!validateEmail(formData.email)) {
            newErrors['email'] = "Please enter a valid email address";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!await validate()) return;

        setIsLoading(true);

        try {
            const message = await authService.initiatePasswordReset(formData.email);
            setIsLoading(false);
            setSuccessMessage(message || 'If an account with that email exists, a password reset link has been sent.');
        } catch (error: any) {
            setIsLoading(false);
            showAlert(
                'error',
                error?.response?.data?.message ||
                error.message ||
                'An error occurred while processing your request.'
            );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };
    return (
        <><Header />
            <div className="breadcrumb" style={{ backgroundImage: "url(/assets/images/bg/breadcrumb1-bg.jpg)" }}>
            </div>
            <div className="section" style={{ padding: '25px 0', position: 'relative' }}>
                <Loader loading={isLoading} isDark={true} fullscreen={false} />
                <div className="container custom-container">
                    <h2 className="mb-4">Forgot Your Password?</h2>
                    <div className="row g-6">

                        <div className="col-lg-6 col-12">
                            <div className="myaccount-content account-details">

                                {successMessage == '' && <div className="account-details-form" style={{ marginBottom: '30px' }}>
                                    <p className="mb-5">Please enter your email address below to receive a password reset link.</p>
                                    <form>
                                        <div className="row g-4">
                                            <div className="col-12 mt-1">
                                                <label htmlFor="email">
                                                    Email <abbr className="required">*</abbr>
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
                                            <div className="col-12">
                                                <button className="btn btn-dark btn-primary-hover w-100" type="button" onClick={handleSubmit} disabled={isLoading}>
                                                    Reset Password
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>}
                                {successMessage != '' && <div className="account-details-form" style={{ marginBottom: '30px' }}>
                                    <p className="mb-5">{successMessage}</p>
                                    <div className="col-12">
                                        <button className="btn btn-dark btn-primary-hover w-100" type="button" onClick={() => navigate(routeUrls.home)} >
                                            Back to home
                                        </button>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer isDark={true} />
        </>
    );
};

export default ForgotPassword;
