import React, { useEffect, useState } from "react";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";
import authService from "../api/authService";

const MyAccount: React.FC = () => {
    const [customerInfo, setCustomerInfo] = useState<any>(null);

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
                    <div className="container custom-container">
                        <div className="row g-lg-10 g-6">
                            {/* My Account Tab List Start */}
                            <div className="col-lg-4 col-12">
                                <ul className="my-account-tab-list nav flex-column" id="accountTab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="account-info-tab" data-bs-toggle="tab" href="#account-info" role="tab">
                                            <i className="dlicon users_single-01"></i> My Account
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className="nav-link"
                                            id="dashboard-tab"
                                            data-bs-toggle="tab"
                                            href="#dashboard"
                                            role="tab"
                                        >
                                            <i className="lastudioicon-home-2"></i> Dashboard
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="orders-tab" data-bs-toggle="tab" href="#orders" role="tab">
                                            <i className="dlicon files_notebook"></i> Orders
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="download-tab" data-bs-toggle="tab" href="#download" role="tab">
                                            <i className="dlicon arrows-1_cloud-download-93"></i> Download
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
                            </div>
                            {/* My Account Tab List End */}

                            {/* My Account Tab Content Start */}
                            <div className="col-lg-8 col-12 mt-2">
                                <div className="tab-content" id="accountTabContent">
                                    {/* Account Info Tab */}
                                    <div className="tab-pane fade show active" id="account-info" role="tabpanel">
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
                                                    <p className="mb-1" >{customerInfo?.firstName} {customerInfo?.lastName}</p>
                                                    <p className="mb-1">{customerInfo?.email}</p>
                                                    <p className="mb-1">
                                                        {customerInfo?.mobile
                                                            ? customerInfo.mobile.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
                                                            : ""}
                                                    </p>

                                                    <div className="d-flex gap-2">
                                                        <a href="#" className="underlined-link account-info-link ">Edit</a>
                                                        <span>|</span>
                                                        <a href="#" className="underlined-link account-info-link ">Change Password</a>
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
