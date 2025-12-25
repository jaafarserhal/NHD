import React, { useEffect, useState } from "react";
import Footer from "../../components/Common/Footer/Index";
import Header from "../../components/Common/Header/Index";
import authService from "../../api/authService";
import { useNavigate } from "react-router-dom";
import { routeUrls } from "../../api/base/routeUrls";
import encryptParameter, { validateEmail, validatePassword } from "../../api/common/Utils";
import Loader from "../../components/Common/Loader/Index";


export default function CreateAccount() {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);

    // Preload the banner image for better performance
    useEffect(() => {
        const img = new Image();
        img.src = '/assets/images/banner/auth-banner.webp';
        img.onload = () => setImageLoaded(true);
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        // Reset errors
        const newErrors: { [key: string]: string } = {};

        // Get form values
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const mobile = formData.get('mobile') as string;
        const emailAddress = formData.get('emailAddress') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Validate required fields
        if (!firstName) newErrors['firstName'] = "First name is required";
        if (!lastName) newErrors['lastName'] = "Last name is required";
        if (!mobile) newErrors['mobile'] = "Mobile number is required";
        if (!emailAddress) {
            newErrors['emailAddress'] = "Email address is required";
        } else if (!validateEmail(emailAddress)) {
            newErrors['emailAddress'] = "Please enter a valid email address";
        }

        if (!password) {
            newErrors['password'] = "Password is required";
        } else {
            const passwordError = validatePassword(password);
            if (passwordError) {
                newErrors['password'] = passwordError;
            }
        }

        if (!confirmPassword) {
            newErrors['confirmPassword'] = "Please confirm your password";
        } else if (password && confirmPassword !== password) {
            newErrors['confirmPassword'] = "Passwords do not match";
        }

        // If there are validation errors, show them and stop
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        const data = {
            firstName,
            lastName,
            mobile,
            emailAddress,
            password,
        };

        try {
            await authService.register(data);
            setErrors({});
            setLoading(false);
            navigate(`${routeUrls.emailVerify}?token=${encryptParameter(emailAddress)}`);
        } catch (error) {
            if (error && (error as any).status === 409) {
                setErrors({ emailAddress: (error as any).data });
            } else {
                setErrors({ general: "An error occurred while creating the account. Please try again later." });
            }
            setLoading(false);
        }
    };

    const handleInputChange = (fieldName: string) => {
        // Remove error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    return (<>
        <Loader loading={loading} />
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
        <div className="section" style={{ padding: '25px 0' }}>
            <div className="container custom-container">
                <div className="row g-6 justify-center">
                    <div className="col-lg-8 col-12">
                        <h2 className="mb-4">Create New Customer Account</h2>
                        <div className="myaccount-content account-details" style={{ padding: '20px 0' }}>
                            <div className="account-details-form">
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="row g-4">
                                        <div className="col-12 mt-1">
                                            <label htmlFor="firstName">
                                                First Name <abbr className="required">*</abbr>
                                            </label>
                                            <input
                                                className="form-field"
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                onChange={() => handleInputChange('firstName')}
                                                style={errors['firstName'] ? { borderColor: 'red' } : {}}
                                            />
                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                {errors['firstName'] || '\u00A0'}
                                            </span>
                                        </div>

                                        <div className="col-12 mt-1">
                                            <label htmlFor="lastName">
                                                Last Name <abbr className="required">*</abbr>
                                            </label>
                                            <input
                                                className="form-field"
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                onChange={() => handleInputChange('lastName')}
                                                style={errors['lastName'] ? { borderColor: 'red' } : {}}
                                            />
                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                {errors['lastName'] || '\u00A0'}
                                            </span>
                                        </div>

                                        <div className="col-12 mt-1">
                                            <label htmlFor="mobile">
                                                Mobile Number <abbr className="required">*</abbr>
                                            </label>
                                            <input
                                                className="form-field"
                                                type="tel"
                                                id="mobile"
                                                name="mobile"
                                                onChange={() => handleInputChange('mobile')}
                                                style={errors['mobile'] ? { borderColor: 'red' } : {}}
                                            />
                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                {errors['mobile'] || '\u00A0'}
                                            </span>
                                        </div>

                                        <div className="col-12 mt-1">
                                            <label htmlFor="emailAddress">
                                                Email Address <abbr className="required">*</abbr>
                                            </label>
                                            <input
                                                className="form-field"
                                                type="email"
                                                id="emailAddress"
                                                name="emailAddress"
                                                onChange={() => handleInputChange('emailAddress')}
                                                style={errors['emailAddress'] ? { borderColor: 'red' } : {}}
                                            />
                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                {errors['emailAddress'] || '\u00A0'}
                                            </span>
                                        </div>

                                        <div className="col-12 mt-1">
                                            <label htmlFor="password">
                                                Password <abbr className="required">*</abbr>
                                            </label>
                                            <input
                                                className="form-field"
                                                type="password"
                                                id="password"
                                                name="password"
                                                onChange={() => handleInputChange('password')}
                                                style={errors['password'] ? { borderColor: 'red' } : {}}
                                            />
                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                {errors['password'] || '\u00A0'}
                                            </span>
                                        </div>

                                        <div className="col-12 mt-1">
                                            <label htmlFor="confirmPassword">
                                                Confirm Password <abbr className="required">*</abbr>
                                            </label>
                                            <input
                                                className="form-field"
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                onChange={() => handleInputChange('confirmPassword')}
                                                style={errors['confirmPassword'] ? { borderColor: 'red' } : {}}
                                            />
                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                {errors['confirmPassword'] || '\u00A0'}
                                            </span>
                                        </div>

                                        <div className="col-12">
                                            <button className="btn btn-dark btn-primary-hover w-100" type="submit">
                                                Create An Account
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
}