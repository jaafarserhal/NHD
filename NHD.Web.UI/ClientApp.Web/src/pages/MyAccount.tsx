import React, { useEffect, useState } from "react";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";
import authService from "../api/authService";
import Loader from "../components/Common/Loader/Index";
import { validatePassword } from "../api/common/Utils";
import toast, { Toaster } from 'react-hot-toast';

const MyAccount: React.FC = () => {
    const [customerInfo, setCustomerInfo] = useState<any>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        firstName: "",
        lastName: "",
        mobile: ""
    });


    useEffect(() => {
        const fetchCustomerInfo = async () => {
            try {
                const info = await authService.getCustomerInfo();
                setCustomerInfo(info);
            } catch (error) {
                console.error("Failed to fetch customer info", error);
            }
        };

        fetchCustomerInfo();
    }, []);

    useEffect(() => {
        if (customerInfo) {
            setFormValues({
                firstName: customerInfo.firstName || "",
                lastName: customerInfo.lastName || "",
                mobile: customerInfo.mobile || ""
            });
        }
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

        // Reset errors
        const newErrors: { [key: string]: string } = {};

        // Get form values
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Validate required fields

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
            password,
        };

        try {
            await authService.changePassword(data);
            setErrors({});
            setLoading(false);
            toast.success("Password changed successfully!");
            // Clear form fields
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
        // Remove error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    return (
        <>
            <Header />
            <div>
                {/* Breadcrumb Section Start */}
                <div
                    className="breadcrumb"
                    style={{
                        backgroundImage: `url('/assets/images/bg/breadcrumb1-bg.jpg')`,
                    }}
                >
                </div>
                {/* Breadcrumb Section End */}

                {/* My Account Section Start */}
                <div className="section" style={{ padding: '25px 0', position: 'relative' }}>

                    <div className="container custom-container" style={{ marginTop: '30px' }}>
                        <div className="row g-lg-10 g-6">
                            {/* My Account Tab List Start */}
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
                                            <i className="dlicon users_single-01"></i> Account Information
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="change-password-tab" data-bs-toggle="tab" href="#change-password" role="tab">
                                            <i className="dlicon lock"></i> Change Password
                                        </a>
                                    </li>

                                    <li className="nav-item">
                                        <a className="nav-link" id="address-tab" data-bs-toggle="tab" href="#address" role="tab">
                                            <i className="dlicon location_map-big"></i> Address
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="login.html">
                                            <i className="dlicon arrows-1_log-out"></i> Logout
                                        </a>
                                    </li>
                                </ul>
                                {/* Custom positioned toaster */}
                                <Toaster
                                    containerStyle={{
                                        top: 0,
                                        left: 0,
                                        position: 'absolute', // absolute inside sidebar
                                        width: '100%',        // match sidebar width
                                    }}
                                    toastOptions={{
                                        style: {
                                            marginBottom: '8px', // spacing between multiple toasts
                                        },
                                    }}
                                />
                            </div>
                            {/* My Account Tab List End */}

                            {/* My Account Tab Content Start */}
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
                                                {/* Contact Information */}
                                                <div className="col-md-6 mb-4 mb-md-0">
                                                    <h6 className="mb-3">Contact Information</h6>
                                                    <p className="mb-1" >{formValues?.firstName} {formValues?.lastName}</p>
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

                                                {/* Newsletters */}
                                                <div className="col-md-6">
                                                    <h6 className="mb-3">Newsletters</h6>
                                                    <p className="mb-1">You aren't subscribed to our newsletter.</p>
                                                    <a href="#" className="underlined-link account-info-link ">Edit</a>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="underlined-header-title border-bottom pb-1 mb-4">
                                                    <span className="h6-title">Address Book</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="underlined-link" style={{ fontFamily: 'salom-regular', fontSize: '.7rem' }}>  Manage Addresses</span>
                                                </div>
                                            </div>

                                            <div className="row">
                                                {/* Default Billing Address */}
                                                <div className="col-md-6 mb-4 mb-md-0">
                                                    <h6 className="mb-3">Default Billing Address</h6>
                                                    <p className="mb-1">You have not set a default billing address.</p>
                                                    <a href="#" className="underlined-link account-info-link ">Edit Address</a>
                                                </div>

                                                {/* Default Shipping Address */}
                                                <div className="col-md-6">
                                                    <h6 className="mb-3">Default Shipping Address</h6>
                                                    <p className="mb-1">You have not set a default shipping address.</p>
                                                    <a href="#" className="underlined-link account-info-link ">Edit Address</a>
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

                                    {/* Account Info Tab */}
                                    <div className="tab-pane fade" id="change-password" role="tabpanel">
                                        <div className="row g-6 justify-center">
                                            <div className="col-lg-8 col-12">
                                                <h3 className="border-bottom pb-1 mb-4">Change Password</h3>
                                                <div className="myaccount-content account-details" style={{ padding: '20px 0' }}>
                                                    <div className="account-details-form">
                                                        <form onSubmit={handleChangePasswordSubmit} noValidate >
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

                                    {/* Dashboard Tab */}
                                    <div className="tab-pane fade" id="dashboard" role="tabpanel">
                                        <div className="myaccount-content dashboard">
                                            <div className="alert alert-light">
                                                Hello <b>didiv91396</b> (not <b>didiv91396</b>?{" "}
                                                <a href="login.html">Log out</a>)
                                            </div>
                                            <p>
                                                From your account dashboard you can view your <u>recent orders</u>, manage your{" "}
                                                <u>shipping and billing addresses</u>, and <u>edit your password and account details</u>.
                                            </p>
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

                                    {/* Download Tab */}
                                    <div className="tab-pane fade" id="download" role="tabpanel">
                                        <div className="myaccount-content download">
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Date</th>
                                                            <th>Expire</th>
                                                            <th>Download</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Haven - Free Real Estate PSD Template</td>
                                                            <td>Aug 22, 2018</td>
                                                            <td>Yes</td>
                                                            <td>
                                                                <a href="#">
                                                                    <i className="dlicon arrows-1_cloud-download-93"></i>{" "}
                                                                    <b>Download File</b>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>HasTech - Profolio Business Template</td>
                                                            <td>Sep 12, 2018</td>
                                                            <td>Never</td>
                                                            <td>
                                                                <a href="#">
                                                                    <i className="dlicon arrows-1_cloud-download-93"></i>{" "}
                                                                    <b>Download File</b>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Tab */}
                                    <div className="tab-pane fade" id="address" role="tabpanel">
                                        <div className="myaccount-content address">
                                            <div className="alert alert-light">
                                                The following addresses will be used on the checkout page by default.
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6 col-12">
                                                    <h4 className="title">
                                                        Billing Address <a href="#" className="edit-link">edit</a>
                                                    </h4>
                                                    <address>
                                                        <p className="name">
                                                            <strong>Alex Tuntuni</strong>
                                                        </p>
                                                        <p className="mb-3">
                                                            1355 Market St, Suite 900 <br />
                                                            San Francisco, CA 94103
                                                        </p>
                                                        <p>Mobile: (123) 456-7890</p>
                                                    </address>
                                                </div>
                                                <div className="col-md-6 col-12">
                                                    <h4 className="title">
                                                        Shipping Address <a href="#" className="edit-link">edit</a>
                                                    </h4>
                                                    <address>
                                                        <p className="name">
                                                            <strong>Alex Tuntuni</strong>
                                                        </p>
                                                        <p className="mb-3">
                                                            1355 Market St, Suite 900 <br />
                                                            San Francisco, CA 94103
                                                        </p>
                                                        <p>Mobile: (123) 456-7890</p>
                                                    </address>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* My Account Tab Content End */}
                        </div>
                    </div>
                </div>
                {/* My Account Section End */}
            </div>
            <Footer isDark={true} />
        </>
    );
};

export default MyAccount;