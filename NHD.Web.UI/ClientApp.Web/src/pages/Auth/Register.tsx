import React, { useEffect, useState } from "react";
import Footer from "../../components/Common/Footer/Index";
import Header from "../../components/Common/Header/Index";
import authService from "../../api/authService";
import { useNavigate } from "react-router-dom";
import { routeUrls } from "../../api/base/routeUrls";
import encryptParameter, { validateEmail, validatePassword } from "../../api/common/Utils";
import Loader from "../../components/Common/Loader/Index";
import FormField from "../../components/Common/FormField/Index";


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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;

        // clear individual error on change
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
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

                                        <FormField
                                            label="First Name"
                                            name="firstName"
                                            onChange={handleInputChange}
                                            error={errors.firstName}
                                            required
                                        />

                                        <FormField
                                            label="Last Name"
                                            name="lastName"
                                            onChange={handleInputChange}
                                            error={errors.lastName}
                                            required
                                        />

                                        <FormField
                                            label="Mobile Number"
                                            name="mobile"
                                            type="tel"
                                            onChange={handleInputChange}
                                            error={errors.mobile}
                                            required
                                        />

                                        <FormField
                                            label="Email Address"
                                            name="emailAddress"
                                            type="email"
                                            onChange={handleInputChange}
                                            error={errors.emailAddress}
                                            required
                                        />

                                        <FormField
                                            label="Password"
                                            name="password"
                                            type="password"
                                            onChange={handleInputChange}
                                            error={errors.password}
                                            required
                                        />

                                        <FormField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            type="password"
                                            onChange={handleInputChange}
                                            error={errors.confirmPassword}
                                            required
                                        />

                                        <div className="col-12 mt-3 d-flex gap-2">
                                            <button className="btn btn-dark btn-primary-hover flex-fill" type="submit">
                                                Create An Account
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
}