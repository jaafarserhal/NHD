import React, { useCallback, useEffect, useState } from "react";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";
import authService from "../api/authService";
import Loader from "../components/Common/Loader/Index";
import { validatePassword } from "../api/common/Utils";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { routeUrls } from "../api/base/routeUrls";
import { CustomerInfo, Address } from "../api/common/Types";
import { AddressTypeEnum } from "../api/common/Enums";


const MyAccount: React.FC = () => {
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        firstName: "",
        lastName: "",
        mobile: "",
        addresses: [] as Address[],
    });

    const [address, setAddress] = useState<Address>({
        id: 0,
        firstName: "",
        lastName: "",
        phone: "",
        streetName: "",
        streetNumber: "",
        postalCode: "",
        city: "",
        typeId: AddressTypeEnum.Billing,
        isPrimary: false
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});

    const fetchCustomerInfo = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authService.getCustomerInfo();
            setCustomerInfo(response.data);
        } catch (error) {
            console.error("Failed to fetch customer info", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomerInfo();
    }, [fetchCustomerInfo]);

    useEffect(() => {
        if (!customerInfo) return;

        const { firstName = "", lastName = "", mobile = "", addresses = [] } = customerInfo;

        setFormValues({
            firstName,
            lastName,
            mobile,
            addresses,
        });
    }, [customerInfo]);

    const handleEditInfoSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        const { firstName, lastName, mobile } = formValues;

        const newErrors: { [key: string]: string } = {};

        if (!firstName) newErrors.firstName = "First name is required";
        if (!lastName) newErrors.lastName = "Last name is required";
        if (!mobile) newErrors.mobile = "Mobile number is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            await authService.updateCustomerInfo({
                firstName,
                lastName,
                mobile
            });

            setErrors({});
            setLoading(false);
            toast.success("Account information updated successfully!");
        } catch (error) {
            setErrors({ general: "Failed to update account information." });
            setLoading(false);
            toast.error("Failed to update account information.");
        }
    };

    const handleChangePasswordSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const newErrors: { [key: string]: string } = {};

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

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

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        const data = {
            password,
        };

        try {
            await authService.changePassword(data);
            setErrors({});
            setLoading(false);
            toast.success("Password changed successfully!");
            form.reset();
        } catch (error) {
            if (error && (error as any).status === 409) {
                setErrors({ emailAddress: (error as any).data });
            } else {
                setErrors({ general: "An error occurred while changing the password. Please try again later." });
            }
            setLoading(false);
            toast.error("Failed to change password.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handlePasswordInputChange = (fieldName: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({
            ...prev,
            [name]: value
        }));

        if (addressErrors[name]) {
            setAddressErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateAddressForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!address.firstName?.trim()) newErrors.firstName = "First name is required";
        if (!address.lastName?.trim()) newErrors.lastName = "Last name is required";
        if (!address.phone?.trim()) newErrors.phone = "Phone number is required";
        if (!address.streetName?.trim()) newErrors.streetName = "Street name is required";
        if (!address.streetNumber?.trim()) newErrors.streetNumber = "Street number is required";
        if (!address.postalCode?.trim()) newErrors.postalCode = "Postal code is required";
        if (!address.city?.trim()) newErrors.city = "City is required";

        return newErrors;
    };

    const handleAddressSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const validationErrors = validateAddressForm();

        if (Object.keys(validationErrors).length > 0) {
            setAddressErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && address.id) {
                await authService.updateAddress(address);
                toast.success("Address updated successfully!");
            } else {
                await authService.addAddress(address);
                toast.success("Address added successfully!");
            }

            setAddress({
                id: 0,
                firstName: "",
                lastName: "",
                phone: "",
                streetName: "",
                streetNumber: "",
                postalCode: "",
                city: "",
                typeId: AddressTypeEnum.Billing,
                isPrimary: false
            });
            setIsEditMode(false);
            setAddressErrors({});

            await fetchCustomerInfo();
            setLoading(false);
        } catch (error) {
            console.error("Failed to save address", error);
            toast.error(isEditMode ? "Failed to update address." : "Failed to add address.");
            setLoading(false);
        }
    };

    const handleEditAddress = async (addressId: number) => {
        try {
            setLoading(true);

            // First switch to address book tab
            const tab = document.getElementById('address-book-tab');
            if (tab) {
                tab.click();
            }

            // Then fetch the address data
            const response = await authService.getAddress(addressId);
            setAddress(response.data);
            setIsEditMode(true);
            setAddressErrors({});

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch address", error);
            toast.error("Failed to load address details.");
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setAddress({
            id: 0,
            firstName: "",
            lastName: "",
            phone: "",
            streetName: "",
            streetNumber: "",
            postalCode: "",
            city: "",
            typeId: AddressTypeEnum.Billing,
            isPrimary: false
        });
        setIsEditMode(false);
        setAddressErrors({});
    };

    const logOut = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.removeItem('authToken');
            setLoading(false);
            navigate(routeUrls.login);
        }, 3000);
    };

    return (
        <>
            <Header />
            <div>
                <div
                    className="breadcrumb"
                    style={{
                        backgroundImage: `url('/assets/images/bg/breadcrumb1-bg.jpg')`,
                    }}
                >
                </div>

                <div className="section" style={{ padding: '25px 0', position: 'relative' }}>
                    <div className="container custom-container" style={{ marginTop: '30px' }}>
                        <div className="row g-lg-10 g-6">
                            <div className="col-lg-4 col-12">
                                <ul className="my-account-tab-list nav flex-column" id="accountTab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="my-account-tab" data-bs-toggle="tab" href="#my-account" role="tab">
                                            <i className="dlicon users_single-01"></i> My Account
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="orders-tab" data-bs-toggle="tab" href="#orders" role="tab">
                                            <i className="dlicon files_notebook"></i> My Orders
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="account-info-tab" data-bs-toggle="tab" href="#account-info" role="tab">
                                            <i className="dlicon business_badge"></i> Account Information
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="change-password-tab" data-bs-toggle="tab" href="#change-password" role="tab">
                                            <i className="dlicon ui-1_lock-circle-open"></i> Change Password
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="address-book-tab" data-bs-toggle="tab" href="#address-book" role="tab">
                                            <i className="dlicon location_pin"></i> Address Book
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" onClick={logOut} href="#" role="tab">
                                            <i className="dlicon arrows-1_log-out"></i> Logout
                                        </a>
                                    </li>
                                </ul>
                                <Toaster
                                    containerStyle={{
                                        top: 0,
                                        left: 0,
                                        position: 'absolute',
                                        width: '100%',
                                    }}
                                    toastOptions={{
                                        style: {
                                            marginBottom: '8px',
                                        },
                                    }}
                                />
                            </div>

                            <div className="col-lg-8 col-12 mt-2">
                                <Loader loading={loading} isDark={true} fullscreen={false} />
                                <div className="tab-content" id="accountTabContent">
                                    {/* My Account Tab */}
                                    <div className="tab-pane fade show active" id="my-account" role="tabpanel">
                                        <div className="myaccount-content account-details">
                                            <div className="col-12">
                                                <h3 className="border-bottom pb-1 mb-4">
                                                    Account Information
                                                </h3>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-6 mb-4 mb-md-0">
                                                    <h6 className="mb-3">Contact Information</h6>
                                                    <p className="mb-1">{formValues?.firstName} {formValues?.lastName}</p>
                                                    {customerInfo?.email && <p className="mb-1">{customerInfo?.email}</p>}
                                                    <p className="mb-1">
                                                        {formValues?.mobile
                                                            ? formValues?.mobile.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
                                                            : ""}
                                                    </p>

                                                    <div className="d-flex gap-2">
                                                        <a
                                                            href="#"
                                                            className="underlined-link account-info-link"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const tab = document.getElementById('account-info-tab');
                                                                if (tab) {
                                                                    tab.click();
                                                                }
                                                            }}
                                                        >
                                                            Edit
                                                        </a>
                                                        <span>|</span>
                                                        <a
                                                            href="#"
                                                            className="underlined-link account-info-link"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const tab = document.getElementById('change-password-tab');
                                                                if (tab) {
                                                                    tab.click();
                                                                }
                                                            }}
                                                        >
                                                            Change Password
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="underlined-header-title border-bottom pb-1 mb-4">
                                                    <span className="h6-title">Address Book</span>&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <span
                                                        className="underlined-link manage-addresses"
                                                        style={{ fontFamily: 'salom-regular', fontSize: '.7rem', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const tab = document.getElementById('address-book-tab');
                                                            if (tab) {
                                                                tab.click();
                                                            }
                                                        }}
                                                    >
                                                        Manage Addresses
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6 mb-4 mb-md-0">
                                                    <h6 className="mb-3">Default Billing Address</h6>
                                                    {!customerInfo?.addresses?.some(a => a.typeId === AddressTypeEnum.Billing) ? (
                                                        <p className="mb-1">You have not set a default billing address.</p>
                                                    ) : (
                                                        <div className="mb-1">
                                                            {customerInfo?.addresses.filter(address => address.typeId === AddressTypeEnum.Billing).map((address, index) => (
                                                                <address key={index}>
                                                                    <p className="name">
                                                                        <strong>{address.firstName} {address.lastName}</strong>
                                                                    </p>
                                                                    <p className="mb-1">
                                                                        {address.streetName} {address.streetNumber} <br />
                                                                        {address.postalCode} {address.city}
                                                                    </p>
                                                                    <p>Mobile: {address.phone
                                                                        ? address.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
                                                                        : ""}</p>
                                                                </address>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {customerInfo?.addresses?.some(a => a.typeId === AddressTypeEnum.Billing && a.isPrimary) && (
                                                        <a
                                                            href="#"
                                                            className="underlined-link account-info-link"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const billingAddr = customerInfo?.addresses?.find(a => a.typeId === AddressTypeEnum.Billing);
                                                                if (billingAddr && billingAddr.id) {
                                                                    handleEditAddress(billingAddr.id);
                                                                } else {
                                                                    const tab = document.getElementById('address-book-tab');
                                                                    if (tab) tab.click();
                                                                }
                                                            }}
                                                        >
                                                            Edit Address
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="col-md-6">
                                                    <h6 className="mb-3">Default Shipping Address</h6>
                                                    {!customerInfo?.addresses?.some(a => a.typeId === AddressTypeEnum.Shipping) ? (
                                                        <p className="mb-1">You have not set a default shipping address.</p>
                                                    ) : (
                                                        <div className="mb-1">
                                                            {customerInfo?.addresses.filter(address => address.typeId === AddressTypeEnum.Shipping).map((address, index) => (
                                                                <address key={index}>
                                                                    <p className="name">
                                                                        <strong>{address.firstName} {address.lastName}</strong>
                                                                    </p>
                                                                    <p className="mb-1">
                                                                        {address.streetName} {address.streetNumber} <br />
                                                                        {address.postalCode} {address.city}
                                                                    </p>
                                                                    <p>Mobile: {address.phone
                                                                        ? address.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
                                                                        : ""}</p>
                                                                </address>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {customerInfo?.addresses?.some(a => a.typeId === AddressTypeEnum.Shipping && a.isPrimary) && (<a
                                                        href="#"
                                                        className="underlined-link account-info-link"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const shippingAddr = customerInfo?.addresses?.find(a => a.typeId === AddressTypeEnum.Shipping);
                                                            if (shippingAddr && shippingAddr.id) {
                                                                handleEditAddress(shippingAddr.id);
                                                            } else {
                                                                const tab = document.getElementById('address-book-tab');
                                                                if (tab) tab.click();
                                                            }
                                                        }}
                                                    >
                                                        Edit Address
                                                    </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Info Tab */}
                                    <div className="tab-pane fade" id="account-info" role="tabpanel">
                                        <div className="row g-6 justify-center">
                                            <div className="col-lg-8 col-12">
                                                <h3 className="border-bottom pb-1 mb-4">Edit Account Information</h3>
                                                <div className="myaccount-content account-details" style={{ padding: '20px 0' }}>
                                                    <div className="account-details-form">
                                                        <form onSubmit={handleEditInfoSubmit} noValidate>
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
                                                                        value={formValues.firstName}
                                                                        onChange={handleInputChange}
                                                                        style={errors.firstName ? { borderColor: 'red' } : {}}
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
                                                                        value={formValues.lastName}
                                                                        onChange={handleInputChange}
                                                                        style={errors.lastName ? { borderColor: 'red' } : {}}
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
                                                                        value={formValues.mobile}
                                                                        onChange={handleInputChange}
                                                                        style={errors.mobile ? { borderColor: 'red' } : {}}
                                                                    />
                                                                    <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                        {errors['mobile'] || '\u00A0'}
                                                                    </span>
                                                                </div>

                                                                <div className="col-12">
                                                                    <button className="btn btn-dark btn-primary-hover w-100" type="submit">
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change Password Tab */}
                                    <div className="tab-pane fade" id="change-password" role="tabpanel">
                                        <div className="row g-6 justify-center">
                                            <div className="col-lg-8 col-12">
                                                <h3 className="border-bottom pb-1 mb-4">Change Password</h3>
                                                <div className="myaccount-content account-details" style={{ padding: '20px 0' }}>
                                                    <div className="account-details-form">
                                                        <form onSubmit={handleChangePasswordSubmit} noValidate>
                                                            <div className="row g-4">
                                                                <div className="col-12 mt-1">
                                                                    <label htmlFor="password">
                                                                        Password <abbr className="required">*</abbr>
                                                                    </label>
                                                                    <input
                                                                        className="form-field"
                                                                        type="password"
                                                                        id="password"
                                                                        name="password"
                                                                        onChange={() => handlePasswordInputChange('password')}
                                                                        style={errors.password ? { borderColor: 'red' } : {}}
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
                                                                        onChange={() => handlePasswordInputChange('confirmPassword')}
                                                                        style={errors.confirmPassword ? { borderColor: 'red' } : {}}
                                                                    />
                                                                    <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                        {errors['confirmPassword'] || '\u00A0'}
                                                                    </span>
                                                                </div>

                                                                <div className="col-12">
                                                                    <button className="btn btn-dark btn-primary-hover w-100" type="submit">
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Orders Tab */}
                                    <div className="tab-pane fade" id="orders" role="tabpanel">
                                        <div className="myaccount-content order">
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Order</th>
                                                            <th>Date</th>
                                                            <th>Status</th>
                                                            <th>Total</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>1</td>
                                                            <td>Aug 22, 2018</td>
                                                            <td>Pending</td>
                                                            <td>$3000</td>
                                                            <td>
                                                                <a href="shopping-cart.html">
                                                                    <b>View</b>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>2</td>
                                                            <td>July 22, 2018</td>
                                                            <td>Approved</td>
                                                            <td>$200</td>
                                                            <td>
                                                                <a href="shopping-cart.html">
                                                                    <b>View</b>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>3</td>
                                                            <td>June 12, 2017</td>
                                                            <td>On Hold</td>
                                                            <td>$990</td>
                                                            <td>
                                                                <a href="shopping-cart.html">
                                                                    <b>View</b>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Book Tab */}
                                    <div className="tab-pane fade" id="address-book" role="tabpanel">
                                        {/* Show default addresses only when NOT in edit mode */}
                                        {!isEditMode && customerInfo?.addresses.length! > 0 && (
                                            <div className="myaccount-content address">
                                                <div className="row g-4">
                                                    <div className="col-12">
                                                        <h3 className="pb-1 mb-4">
                                                            Default Addresses
                                                        </h3>
                                                    </div>

                                                    <div className="col-lg-6 col-12">
                                                        <h6 className="underlined-header-title">Default Billing Address</h6>
                                                        <div className="myaccount-content account-details">
                                                            <div className="account-details-form" style={{ marginBottom: '30px' }}>
                                                                {customerInfo?.addresses.filter(address => address.typeId === AddressTypeEnum.Billing).map((address, index) => (
                                                                    <address key={index} style={{ marginTop: '20px' }}>
                                                                        <p className="name">
                                                                            <strong>{address.firstName} {address.lastName}</strong>
                                                                        </p>
                                                                        <p className="mb-1">
                                                                            {address.streetName} {address.streetNumber} <br />
                                                                            {address.postalCode} {address.city}
                                                                        </p>
                                                                        <p>Mobile: {address.phone
                                                                            ? address.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
                                                                            : ""}</p>
                                                                    </address>
                                                                ))}
                                                                <a
                                                                    href="#"
                                                                    className="underlined-link account-info-link"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        const billingAddr = customerInfo?.addresses?.find(a => a.typeId === AddressTypeEnum.Billing);
                                                                        if (billingAddr && billingAddr.id) {
                                                                            handleEditAddress(billingAddr.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    Changing Billing Address
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-6 col-12">
                                                        <h6 className="underlined-header-title">Default Shipping Address</h6>
                                                        <div className="myaccount-content account-details">
                                                            <div className="account-details-form">
                                                                {customerInfo?.addresses.filter(address => address.typeId === AddressTypeEnum.Shipping).map((address, index) => (
                                                                    <address key={index} style={{ marginTop: '20px' }}>
                                                                        <p className="name">
                                                                            <strong>{address.firstName} {address.lastName}</strong>
                                                                        </p>
                                                                        <p className="mb-1">
                                                                            {address.streetName} {address.streetNumber} <br />
                                                                            {address.postalCode} {address.city}
                                                                        </p>
                                                                        <p>Mobile: {address.phone
                                                                            ? address.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
                                                                            : ""}</p>
                                                                    </address>
                                                                ))}
                                                                <a
                                                                    href="#"
                                                                    className="underlined-link account-info-link"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        const shippingAddr = customerInfo?.addresses?.find(a => a.typeId === AddressTypeEnum.Shipping);
                                                                        if (shippingAddr && shippingAddr.id) {
                                                                            handleEditAddress(shippingAddr.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    Changing Shipping Address
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <h6 className="underlined-header-title">Additional Address Entries</h6>
                                                        <p className="mb-3">You have no other address entries in your address book.</p>
                                                        <button
                                                            className="btn btn-dark btn-primary-hover"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setIsEditMode(true);
                                                                setAddress({
                                                                    id: 0,
                                                                    firstName: '',
                                                                    lastName: '',
                                                                    phone: '',
                                                                    streetName: '',
                                                                    streetNumber: '',
                                                                    postalCode: '',
                                                                    city: '',
                                                                    typeId: AddressTypeEnum.Billing,
                                                                    isPrimary: false
                                                                });
                                                                setAddressErrors({});
                                                            }}
                                                        >
                                                            Add New Address
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {isEditMode || customerInfo?.addresses.length == 0 && (
                                            <div className="myaccount-content address">
                                                <div className="row g-4">
                                                    <div className="col-12">
                                                        <h3 className="border-bottom pb-1 mb-4">
                                                            {address.id ? 'Edit Address' : 'Add New Address'}
                                                        </h3>
                                                    </div>

                                                    <div className="col-lg-6 col-12">
                                                        <h6 className="underlined-header-title">Contact Information</h6>
                                                        <div className="myaccount-content account-details">
                                                            <div className="account-details-form">
                                                                <form style={{ marginTop: '35px' }} onSubmit={handleAddressSubmit}>
                                                                    <div className="row g-4">
                                                                        {!address.id && (
                                                                            <div className="col-12 mt-1" style={{ marginBottom: '28px' }}>
                                                                                <label htmlFor="typeId">
                                                                                    Address Type <abbr className="required">*</abbr>
                                                                                </label>
                                                                                <select
                                                                                    id="typeId"
                                                                                    name="typeId"
                                                                                    className="form-field select-input-style"
                                                                                    style={addressErrors.typeId ? { borderColor: 'red' } : {}}
                                                                                    value={address.typeId}
                                                                                    onChange={handleAddressInputChange}
                                                                                >
                                                                                    <option value="">Select address type</option>
                                                                                    <option value={AddressTypeEnum.Billing}>Billing</option>
                                                                                    <option value={AddressTypeEnum.Shipping}>Shipping</option>
                                                                                </select>
                                                                                <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                                    {addressErrors['typeId'] || '\u00A0'}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <div className="col-12 mt-1">
                                                                            <label htmlFor="addressFirstName">
                                                                                First Name <abbr className="required">*</abbr>
                                                                            </label>
                                                                            <input
                                                                                id="addressFirstName"
                                                                                name="firstName"
                                                                                type="text"
                                                                                placeholder="Enter first name"
                                                                                className="form-field"
                                                                                value={address.firstName}
                                                                                onChange={handleAddressInputChange}
                                                                                style={addressErrors.firstName ? { borderColor: 'red' } : {}}
                                                                            />
                                                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                                {addressErrors['firstName'] || '\u00A0'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="col-12 mt-1">
                                                                            <label htmlFor="addressLastName">
                                                                                Last Name <abbr className="required">*</abbr>
                                                                            </label>
                                                                            <input
                                                                                id="addressLastName"
                                                                                name="lastName"
                                                                                type="text"
                                                                                placeholder="Enter last name"
                                                                                className="form-field"
                                                                                value={address.lastName}
                                                                                onChange={handleAddressInputChange}
                                                                                style={addressErrors.lastName ? { borderColor: 'red' } : {}}
                                                                            />
                                                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                                {addressErrors['lastName'] || '\u00A0'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="col-12 mt-1">
                                                                            <label htmlFor="addressPhone">
                                                                                Mobile Number <abbr className="required">*</abbr>
                                                                            </label>
                                                                            <input
                                                                                id="addressPhone"
                                                                                name="phone"
                                                                                type="tel"
                                                                                placeholder="Enter phone number"
                                                                                className="form-field"
                                                                                value={address.phone}
                                                                                onChange={handleAddressInputChange}
                                                                                style={addressErrors.phone ? { borderColor: 'red' } : {}}
                                                                            />
                                                                            <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                                {addressErrors['phone'] || '\u00A0'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-6 col-12">
                                                        <h6 className="underlined-header-title">Address</h6>
                                                        <div className="myaccount-content account-details">
                                                            <div className="account-details-form">
                                                                <form onSubmit={handleAddressSubmit}>
                                                                    <div className="col-12 mt-1">
                                                                        <label htmlFor="streetName">
                                                                            Street Name <abbr className="required">*</abbr>
                                                                        </label>
                                                                        <input
                                                                            id="streetName"
                                                                            name="streetName"
                                                                            type="text"
                                                                            className="form-field"
                                                                            placeholder="Enter street name"
                                                                            value={address.streetName}
                                                                            onChange={handleAddressInputChange}
                                                                            style={addressErrors.streetName ? { borderColor: 'red' } : {}}
                                                                        />
                                                                        <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                            {addressErrors['streetName'] || '\u00A0'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="col-12 mt-1">
                                                                        <label htmlFor="streetNumber">
                                                                            Street Number <abbr className="required">*</abbr>
                                                                        </label>
                                                                        <input
                                                                            id="streetNumber"
                                                                            name="streetNumber"
                                                                            type="text"
                                                                            className="form-field"
                                                                            placeholder="Enter street number"
                                                                            value={address.streetNumber}
                                                                            onChange={handleAddressInputChange}
                                                                            style={addressErrors.streetNumber ? { borderColor: 'red' } : {}}
                                                                        />
                                                                        <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                            {addressErrors['streetNumber'] || '\u00A0'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="col-12 mt-1">
                                                                        <label htmlFor="postalCode">
                                                                            Postal Code <abbr className="required">*</abbr>
                                                                        </label>
                                                                        <input
                                                                            id="postalCode"
                                                                            name="postalCode"
                                                                            type="text"
                                                                            className="form-field"
                                                                            placeholder="Enter postal code"
                                                                            value={address.postalCode}
                                                                            onChange={handleAddressInputChange}
                                                                            style={addressErrors.postalCode ? { borderColor: 'red' } : {}}
                                                                        />
                                                                        <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                            {addressErrors['postalCode'] || '\u00A0'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="col-12 mt-1">
                                                                        <label htmlFor="city">
                                                                            City <abbr className="required">*</abbr>
                                                                        </label>
                                                                        <input
                                                                            id="city"
                                                                            name="city"
                                                                            type="text"
                                                                            className="form-field"
                                                                            placeholder="Enter city"
                                                                            value={address.city}
                                                                            onChange={handleAddressInputChange}
                                                                            style={addressErrors.city ? { borderColor: 'red' } : {}}
                                                                        />
                                                                        <span style={{ color: 'red', fontSize: '14px', marginTop: '4px', display: 'block', minHeight: '20px' }}>
                                                                            {addressErrors['city'] || '\u00A0'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="col-12 mt-3 d-flex gap-2">
                                                                        <button className="btn btn-dark btn-primary-hover flex-fill" type="submit">
                                                                            {address.id ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-outline-dark flex-fill"
                                                                            type="button"
                                                                            onClick={handleCancelEdit}
                                                                        >
                                                                            CANCEL
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer isDark={true} />
        </>
    );
};

export default MyAccount;