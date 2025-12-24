import React, { useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../../api/authService';
import { validatePassword } from '../../api/common/Utils';
import FormField from '../Common/FormField/Index';


const ChangePasswordTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        const validationErrors: { [key: string]: string } = {};

        if (!password) {
            validationErrors.password = "Password is required";
        } else {
            const passwordError = validatePassword(password);
            if (passwordError) {
                validationErrors.password = passwordError;
            }
        }

        if (!confirmPassword) {
            validationErrors.confirmPassword = "Please confirm your password";
        } else if (password && confirmPassword !== password) {
            validationErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword({ password });
            setErrors({});
            toast.success("Password changed successfully!");
            form.reset();
        } catch (error: any) {
            if (error?.status === 409) {
                setErrors({ emailAddress: error.data });
            } else {
                setErrors({ general: "An error occurred while changing the password." });
            }
            toast.error("Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (fieldName: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    return (
        <div className="tab-pane fade" id="change-password" role="tabpanel">
            <div className="row g-6 justify-center">
                <div className="col-lg-8 col-12">
                    <h3 className="border-bottom pb-1 mb-4">Change Password</h3>
                    <div className="myaccount-content account-details" style={{ padding: '20px 0' }}>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="row g-4">
                                <FormField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    error={errors.password}
                                    onChange={() => handleFieldChange('password')}
                                    required
                                />
                                <FormField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    error={errors.confirmPassword}
                                    onChange={() => handleFieldChange('confirmPassword')}
                                    required
                                />
                                <div className="col-12">
                                    <button
                                        className="btn btn-dark btn-primary-hover w-100"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordTab;