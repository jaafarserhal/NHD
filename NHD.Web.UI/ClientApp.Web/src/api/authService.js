import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class authService extends apiService {
    constructor() {
        super('/Customer');
    }

    // Login user
    async login(credentials) {
        return this.post(credentials, 'login');
    }

    // Logout user
    async logout() {
        return this.post({}, 'logout');
    }

    // Register new user
    async register(userData) {
        return this.post(userData, apiUrls.registerCustomer);
    }

    // Verify email
    async verifyEmail(token) {
        return this.post(token, apiUrls.verifyCustomerEmail);
    }

    // Refresh token
    async refreshToken(token) {
        return this.post({ token }, 'refresh-token');
    }
}
export default new authService();
