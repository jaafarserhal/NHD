import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";
import Loader from "../components/Common/Loader/Index";
import AccountSidebar from "../components/MyAccount/AccountSidebar";
import AccountOverviewTab from "../components/MyAccount/AccountOverviewTab";
import AccountInfoTab from "../components/MyAccount/AccountInfoTab";
import ChangePasswordTab from "../components/MyAccount/ChangePasswordTab";
import AddressBookTab from "../components/MyAccount/AddressBookTab";
import authService from "../api/authService";
import { routeUrls } from "../api/base/routeUrls";
import { CustomerInfo, Address } from "../api/common/Types";
import OrdersTab from "../components/MyAccount/OrdersTab";

const MyAccount: React.FC = () => {
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchCustomerInfo = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authService.getCustomerInfo();
            setCustomerInfo(response.data);
        } catch (error) {
            console.error("Failed to fetch customer info", error);
            toast.error("Failed to load customer information.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomerInfo();
    }, [fetchCustomerInfo]);

    const handleLogout = () => {
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
                />

                <div className="section" style={{ padding: '25px 0', position: 'relative' }}>
                    <div className="container custom-container" style={{ marginTop: '30px' }}>
                        <div className="row g-lg-10 g-6">
                            <div className="col-lg-4 col-12">
                                <AccountSidebar onLogout={handleLogout} />
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
                                    <AccountOverviewTab
                                        customerInfo={customerInfo}
                                        onRefresh={fetchCustomerInfo}
                                    />
                                    <OrdersTab />
                                    <AccountInfoTab
                                        customerInfo={customerInfo}
                                        onUpdate={fetchCustomerInfo}
                                    />
                                    <ChangePasswordTab />
                                    <AddressBookTab
                                        customerInfo={customerInfo}
                                        onRefresh={fetchCustomerInfo}
                                    />
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