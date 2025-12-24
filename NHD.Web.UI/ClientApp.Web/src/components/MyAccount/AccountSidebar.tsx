import React from 'react';

interface AccountSidebarProps {
    onLogout: () => void;
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ onLogout }) => {
    return (
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
                <a className="nav-link" onClick={onLogout} href="#" role="tab">
                    <i className="dlicon arrows-1_log-out"></i> Logout
                </a>
            </li>
        </ul>
    );
};

export default AccountSidebar;