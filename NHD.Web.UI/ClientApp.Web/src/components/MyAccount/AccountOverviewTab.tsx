import React from 'react';
import { CustomerInfo } from '../../api/common/Types';
import { AddressTypeEnum } from '../../api/common/Enums';
import { formatPhoneNumber, switchTab } from '../../api/common/Utils';
import AddressDisplay from './AddressDisplay';

interface AccountOverviewTabProps {
    customerInfo: CustomerInfo | null;
    onRefresh: () => void;
}

const AccountOverviewTab: React.FC<AccountOverviewTabProps> = ({ customerInfo, onRefresh }) => {
    const billingAddress = customerInfo?.addresses?.find(a => a.typeId === AddressTypeEnum.Billing && a.isPrimary);
    const shippingAddress = customerInfo?.addresses?.find(a => a.typeId === AddressTypeEnum.Shipping && a.isPrimary);

    const handleEditAddress = async (addressId: number) => {
        switchTab('address-book-tab');
        // Trigger edit in AddressBookTab through a custom event
        window.dispatchEvent(new CustomEvent('editAddress', { detail: { addressId } }));
    };

    return (
        <div className="tab-pane fade show active" id="my-account" role="tabpanel">
            <div className="myaccount-content account-details">
                <div className="col-12">
                    <h3 className="border-bottom pb-1 mb-4">Account Information</h3>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6 mb-4 mb-md-0">
                        <h6 className="mb-3">Contact Information</h6>
                        <p className="mb-1">
                            {customerInfo?.firstName} {customerInfo?.lastName}
                        </p>
                        {customerInfo?.email && <p className="mb-1">{customerInfo.email}</p>}
                        <p className="mb-1">{formatPhoneNumber(customerInfo?.mobile)}</p>

                        <div className="d-flex gap-2">
                            <a
                                href="#"
                                className="underlined-link account-info-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    switchTab('account-info-tab');
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
                                    switchTab('change-password-tab');
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
                                switchTab('address-book-tab');
                            }}
                        >
                            Manage Addresses
                        </span>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-4 mb-md-0">
                        <h6 className="mb-3">Default Billing Address</h6>
                        {!billingAddress ? (
                            <p className="mb-1">You have not set a default billing address.</p>
                        ) : (
                            <>
                                <AddressDisplay address={billingAddress} />
                                {billingAddress.isPrimary && (
                                    <a
                                        href="#"
                                        className="underlined-link account-info-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (billingAddress.id) {
                                                handleEditAddress(billingAddress.id);
                                            }
                                        }}
                                    >
                                        Edit Address
                                    </a>
                                )}
                            </>
                        )}
                    </div>

                    <div className="col-md-6">
                        <h6 className="mb-3">Default Shipping Address</h6>
                        {!shippingAddress ? (
                            <p className="mb-1">You have not set a default shipping address.</p>
                        ) : (
                            <>
                                <AddressDisplay address={shippingAddress} />
                                {shippingAddress.isPrimary && (
                                    <a
                                        href="#"
                                        className="underlined-link account-info-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (shippingAddress.id) {
                                                handleEditAddress(shippingAddress.id);
                                            }
                                        }}
                                    >
                                        Edit Address
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AccountOverviewTab;