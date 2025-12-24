import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CustomerInfo } from '../../api/common/Types';
import authService from '../../api/authService';
import FormField from '../Common/FormField/Index';
import { useFormValidation } from '../../api/hooks/useFormValidation';

interface AccountInfoTabProps {
    customerInfo: CustomerInfo | null;
    onUpdate: () => void;
}

const AccountInfoTab: React.FC<AccountInfoTabProps> = ({ customerInfo, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const { values, errors, setValues, setErrors, handleChange, validateField } = useFormValidation({
        firstName: '',
        lastName: '',
        mobile: '',
    });

    useEffect(() => {
        if (customerInfo) {
            setValues({
                firstName: customerInfo.firstName || '',
                lastName: customerInfo.lastName || '',
                mobile: customerInfo.mobile || '',
            });
        }
    }, [customerInfo]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const validationErrors: { [key: string]: string } = {};
        if (!values.firstName) validationErrors.firstName = "First name is required";
        if (!values.lastName) validationErrors.lastName = "Last name is required";
        if (!values.mobile) validationErrors.mobile = "Mobile number is required";

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            await authService.updateCustomerInfo({
                firstName: values.firstName,
                lastName: values.lastName,
                mobile: values.mobile
            });

            setErrors({});
            toast.success("Account information updated successfully!");
            onUpdate();
        } catch (error) {
            toast.error("Failed to update account information.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-pane fade" id="account-info" role="tabpanel">
            <div className="row g-6 justify-center">
                <div className="col-lg-8 col-12">
                    <h3 className="border-bottom pb-1 mb-4">Edit Account Information</h3>
                    <div className="myaccount-content account-details" style={{ padding: '20px 0' }}>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="row g-4">
                                <FormField
                                    label="First Name"
                                    name="firstName"
                                    value={values.firstName}
                                    error={errors.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <FormField
                                    label="Last Name"
                                    name="lastName"
                                    value={values.lastName}
                                    error={errors.lastName}
                                    onChange={handleChange}
                                    required
                                />
                                <FormField
                                    label="Mobile Number"
                                    name="mobile"
                                    type="tel"
                                    value={values.mobile}
                                    error={errors.mobile}
                                    onChange={handleChange}
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

export default AccountInfoTab;