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

}
export default new authService();
