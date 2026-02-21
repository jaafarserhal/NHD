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

    async resendVerificationEmail(email) {
        return this.post(email, apiUrls.resendVerificationEmail);
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

    async setAddressAsDefault(addressId, addressTypeId) {
        return this.put({}, apiUrls.setDefaultCustomerAddress + `/${addressId}/${addressTypeId}`);
    }

    async deleteAddress(addressId) {
        return this.delete(`${apiUrls.deleteCustomerAddress}/${addressId}`);
    }

    async getAddress(addressId) {
        return this.get(`${apiUrls.getCustomerAddress}/${addressId}`);
    }

    async getCustomerAddresses() {
        return this.get(apiUrls.getCustomerAddresses);
    }

    // Place order as guest
    async placeOrderAsGuest(guestCheckoutData) {
        return this.post(guestCheckoutData, apiUrls.placeOrderAsGuest);
    }

    // Place order as authenticated customer
    async placeOrder(customerCheckoutData) {
        return this.post(customerCheckoutData, apiUrls.placeOrder);
    }

    // Payment methods
    async createPaymentIntent(paymentData) {
        return this.post(paymentData, apiUrls.createPaymentIntent);
    }

    async confirmPayment(confirmData) {
        return this.post(confirmData, apiUrls.confirmPayment);
    }

    async getPaymentStatus(paymentIntentId) {
        return this.get(`${apiUrls.getPaymentStatus}/${paymentIntentId}`);
    }

    async getSystemProperties() {
        return this.get(apiUrls.getSystemProperties);
    }
}
export default new authService();
