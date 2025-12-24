import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class authService extends apiService {
    constructor() {
        super('/Customer');
    }

    // Register new user
    async register(userData) {
        return this.post(userData, apiUrls.registerCustomer);
    }

    // Verify email
    async verifyEmail(token) {
        return this.post(token, apiUrls.verifyCustomerEmail);
    }

    // Get current user info
    async getCustomerInfo() {
        return this.get(apiUrls.customerInfo);
    }

    // Change password
    async changePassword(passwordData) {
        return this.put(passwordData, apiUrls.changeCustomerPassword);
    }

    // Update customer information
    async updateCustomerInfo(customerData) {
        return this.put(customerData, apiUrls.updateCustomerInfo);
    }

    // Initiate password reset
    async initiatePasswordReset(email) {
        const response = await this.post(email, apiUrls.initiatePasswordReset);
        return response.data?.message;
    }


    // Reset password
    async resetPassword(resetData) {
        return this.put(resetData, apiUrls.resetPassword);
    }

    async addAddress(addressData) {
        return this.post(addressData, apiUrls.addCustomerAddress);
    }

    async updateAddress(addressData) {
        return this.put(addressData, apiUrls.updateCustomerAddress);
    }

    async getAddress(addressId) {
        return this.get(`${apiUrls.getCustomerAddress}/${addressId}`);
    }
}
export default new authService();
