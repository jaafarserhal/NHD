import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CustomerInfo, Address } from '../../api/common/Types';
import { AddressTypeEnum } from '../../api/common/Enums';
import authService from '../../api/authService';
import AddressForm from './AddressForm';
import AddressDisplay from './AddressDisplay';

interface AddressBookTabProps {
    customerInfo: CustomerInfo | null;
    onRefresh: () => void;
}

const AddressBookTab: React.FC<AddressBookTabProps> = ({ customerInfo, onRefresh }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
    const [currentAddress, setCurrentAddress] = useState<Address>({
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

    useEffect(() => {
        // Listen for edit address events from AccountOverviewTab
        const handleEditAddress = async (event: CustomEvent) => {
            const { addressId } = event.detail;
            await loadAddress(addressId);
        };

        window.addEventListener('editAddress' as any, handleEditAddress as any);
        return () => {
            window.removeEventListener('editAddress' as any, handleEditAddress as any);
        };
    }, []);

    const loadAddress = async (addressId: number) => {
        try {
            setLoading(true);
            const response = await authService.getAddress(addressId);
            setCurrentAddress(response.data);
            setIsEditMode(true);
        } catch (error) {
            console.error("Failed to fetch address", error);
            toast.error("Failed to load address details.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setCurrentAddress({
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
        setIsEditMode(true);
    };

    const handleEdit = (addressId: number) => {
        loadAddress(addressId);
    };

    const handleCancel = () => {
        setCurrentAddress({
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
        // If there are no addresses, navigate back to My Account tab
        const hasAddresses = (customerInfo?.addresses?.length || 0) > 0;
        if (!hasAddresses) {
            const myAccountTab = document.getElementById('my-account-tab');
            if (myAccountTab) {
                myAccountTab.click();
            }
        }
    };

    const handleSubmit = async (address: Address) => {
        setLoading(true);
        try {
            if (address.id) {
                await authService.updateAddress(address);
                toast.success("Address updated successfully!");
            } else {
                await authService.addAddress(address);
                toast.success("Address added successfully!");
            }

            handleCancel();
            await onRefresh();
        } catch (error) {
            console.error("Failed to save address", error);
            toast.error(address.id ? "Failed to update address." : "Failed to add address.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (addressId: number) => {
        setAddressToDelete(addressId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!addressToDelete) return;
        try {
            setLoading(true);
            await authService.deleteAddress(addressToDelete);
            toast.success("Address deleted successfully!");
            setShowDeleteModal(false);
            setAddressToDelete(null);
            await onRefresh();
        } catch (error) {
            console.error("Failed to delete address", error);
            toast.error("Failed to delete address.");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setAddressToDelete(null);
    };

    const handleMakeDefault = async (addressId: number, addressTypeId: number) => {
        if (!addressId) return;
        try {
            setLoading(true);
            await authService.setAddressAsDefault(addressId, addressTypeId);
            toast.success("Default address updated!");
            await onRefresh();
        } catch (error) {
            console.error("Failed to set default address", error);
            toast.error("Failed to update default address.");
        } finally {
            setLoading(false);
        }
    };

    const billingAddresses = customerInfo?.addresses?.filter(a => a.typeId === AddressTypeEnum.Billing) || [];
    const shippingAddresses = customerInfo?.addresses?.filter(a => a.typeId === AddressTypeEnum.Shipping) || [];
    const hasAddresses = (customerInfo?.addresses?.length || 0) > 0;

    if (isEditMode || !hasAddresses) {
        return (
            <div className="tab-pane fade" id="address-book" role="tabpanel">
                <div className="myaccount-content address">
                    <div className="row g-4">
                        <div className="col-12">
                            <h3 className="border-bottom pb-1 mb-4">
                                {currentAddress.id ? 'Edit ' + (currentAddress.typeId === AddressTypeEnum.Billing ? 'Billing' : 'Shipping') + ' Address' : 'Add New Address'}
                            </h3>
                        </div>
                        <AddressForm
                            address={currentAddress}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane fade" id="address-book" role="tabpanel">
            <div className="myaccount-content address">
                <div className="row g-4">
                    <div className="col-12">
                        <h3 className="pb-1 mb-4">Address Book</h3>
                    </div>

                    <div className="col-lg-6 col-12">
                        <h6 className="underlined-header-title">Billing Address</h6>
                        <div className="myaccount-content account-details">
                            <div className="account-details-form" style={{ marginBottom: '30px' }}>
                                {billingAddresses.length === 0 ? (
                                    <p style={{ marginTop: '20px' }}>No billing address set.</p>
                                ) : (
                                    billingAddresses.map((address, index) => (
                                        <div key={index} style={{ marginTop: '20px' }}>
                                            <AddressDisplay address={address} />

                                            {address.isPrimary && (
                                                <div style={{
                                                    marginTop: '10px',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#f0f8ff',
                                                    borderLeft: '3px solid #007bff',
                                                    fontSize: '14px',
                                                    fontWeight: 500
                                                }}>
                                                    Default Billing Address
                                                </div>
                                            )}

                                            <div className="address-actions">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => address.id && handleEdit(address.id)}
                                                    title="Edit"
                                                >
                                                    <i className="dlicon files_edit" />
                                                </button>

                                                {!address.isPrimary && (<button
                                                    className="icon-btn"
                                                    onClick={() => address.id && handleDeleteClick(address.id)}
                                                    title="Delete"
                                                >
                                                    <i className="dlicon ui-1_trash-round" />
                                                </button>
                                                )}

                                                {!address.isPrimary && (
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => address.id && handleMakeDefault(address.id, AddressTypeEnum.Billing)}
                                                        title="Set as Default"
                                                        disabled={loading}
                                                    >
                                                        <i className="dlicon ui-2_favourite-31" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-12">
                        <h6 className="underlined-header-title">Shipping Address</h6>
                        <div className="myaccount-content account-details">
                            <div className="account-details-form">
                                {shippingAddresses.length === 0 ? (
                                    <p style={{ marginTop: '20px' }}>No shipping address set.</p>
                                ) : (
                                    shippingAddresses.map((address, index) => (
                                        <div key={index} style={{ marginTop: '20px' }}>
                                            <AddressDisplay address={address} />

                                            {address.isPrimary && (
                                                <div style={{
                                                    marginTop: '10px',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#f0f8ff',
                                                    borderLeft: '3px solid #007bff',
                                                    fontSize: '14px',
                                                    fontWeight: 500
                                                }}>
                                                    Default Shipping Address
                                                </div>
                                            )}

                                            <div className="address-actions">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => address.id && handleEdit(address.id)}
                                                    title="Edit"
                                                >
                                                    <i className="dlicon files_edit" />
                                                </button>

                                                {!address.isPrimary && (<button
                                                    className="icon-btn"
                                                    onClick={() => address.id && handleDeleteClick(address.id)}
                                                    title="Delete"
                                                >
                                                    <i className="dlicon ui-1_trash-round" />
                                                </button>)}

                                                {!address.isPrimary && (
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => address.id && handleMakeDefault(address.id, AddressTypeEnum.Shipping)}
                                                        title="Set as Default"
                                                        disabled={loading}
                                                    >
                                                        <i className="dlicon ui-2_favourite-31" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <h6 className="underlined-header-title">Additional Address Entries</h6>
                        <p className="mb-3">You have no other address entries in your address book.</p>
                        <button
                            className="btn btn-dark btn-primary-hover"
                            onClick={handleAddNew}
                        >
                            Add New Address
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleDeleteCancel}
                                    disabled={loading}
                                    aria-label="Close"
                                />
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this address? This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleDeleteCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteConfirm}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressBookTab;