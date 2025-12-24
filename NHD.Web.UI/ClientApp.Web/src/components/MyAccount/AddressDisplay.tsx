import React from 'react';
import { Address } from '../../api/common/Types';
import { formatPhoneNumber } from '../../api/common/Utils';

interface AddressDisplayProps {
    address: Address;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address }) => {
    return (
        <address className="mb-1">
            <p className="name">
                <strong>{address.firstName} {address.lastName}</strong>
            </p>
            <p className="mb-1">
                {address.streetName} {address.streetNumber} <br />
                {address.postalCode} {address.city}
            </p>
            <p>Mobile: {formatPhoneNumber(address.phone)}</p>
        </address>
    );
};

export default AddressDisplay;