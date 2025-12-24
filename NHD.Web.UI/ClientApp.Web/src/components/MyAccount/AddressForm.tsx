import React, { useState, useEffect } from 'react';
import { Address } from '../../api/common/Types';
import { AddressTypeEnum } from '../../api/common/Enums';
import FormField from '../Common/FormField/Index';

interface AddressFormProps {
    address: Address;
    onSubmit: (address: Address) => void;
    onCancel: () => void;
    loading: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState<Address>(address);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setFormData(address);
        setErrors({});
    }, [address]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const validationErrors: { [key: string]: string } = {};

        if (!formData.firstName?.trim()) validationErrors.firstName = "First name is required";
        if (!formData.lastName?.trim()) validationErrors.lastName = "Last name is required";
        if (!formData.phone?.trim()) validationErrors.phone = "Phone number is required";
        if (!formData.streetName?.trim()) validationErrors.streetName = "Street name is required";
        if (!formData.streetNumber?.trim()) validationErrors.streetNumber = "Street number is required";
        if (!formData.postalCode?.trim()) validationErrors.postalCode = "Postal code is required";
        if (!formData.city?.trim()) validationErrors.city = "City is required";
        if (!formData.id && !formData.typeId) validationErrors.typeId = "Address type is required";

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <>
            <div className="col-lg-6 col-12">
                <h6 className="underlined-header-title">Contact Information</h6>
                <div className="myaccount-content account-details">
                    <div className="account-details-form">
                        <form style={{ marginTop: '35px' }} onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {!formData.id && (
                                    <div className="col-12 mt-1" style={{ marginBottom: '28px' }}>
                                        <label htmlFor="typeId">
                                            Address Type <abbr className="required">*</abbr>
                                        </label>
                                        <select
                                            id="typeId"
                                            name="typeId"
                                            className="form-field select-input-style"
                                            value={formData.typeId}
                                            onChange={handleChange}
                                        >
                                            <option value={AddressTypeEnum.Billing}>Billing</option>
                                            <option value={AddressTypeEnum.Shipping}>Shipping</option>
                                        </select>
                                    </div>
                                )}

                                <FormField
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    error={errors.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    required
                                />

                                <FormField
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    error={errors.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    required
                                />

                                <FormField
                                    label="Mobile Number"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    error={errors.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="col-lg-6 col-12">
                <h6 className="underlined-header-title">Address</h6>
                <div className="myaccount-content account-details">
                    <div className="account-details-form">
                        <form onSubmit={handleSubmit}>
                            <FormField
                                label="Street Name"
                                name="streetName"
                                value={formData.streetName}
                                error={errors.streetName}
                                onChange={handleChange}
                                placeholder="Enter street name"
                                required
                            />

                            <FormField
                                label="Street Number"
                                name="streetNumber"
                                value={formData.streetNumber}
                                error={errors.streetNumber}
                                onChange={handleChange}
                                placeholder="Enter street number"
                                required
                            />

                            <FormField
                                label="Postal Code"
                                name="postalCode"
                                value={formData.postalCode}
                                error={errors.postalCode}
                                onChange={handleChange}
                                placeholder="Enter postal code"
                                required
                            />

                            <FormField
                                label="City"
                                name="city"
                                value={formData.city}
                                error={errors.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                required
                            />

                            <div className="col-12 mt-3 d-flex gap-2">
                                <button
                                    className="btn btn-dark btn-primary-hover flex-fill"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {formData.id ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                                </button>
                                <button
                                    className="btn btn-outline-dark flex-fill"
                                    type="button"
                                    onClick={onCancel}
                                    disabled={loading}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddressForm;