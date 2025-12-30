import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class customerService extends apiService {
    constructor() {
        super(apiUrls.customers);
    }

    // Get all customers
    async getCustomers(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }

    // Update customer status
    async updateCustomerStatus(model) {
        return this.put(model, `${apiUrls.updateCustomerStatus}`);
    }

    // Get addresses by customer ID
    async getAddressesByCustomerId(customerId, page = 1, limit = 10) {
        return this.get(`${apiUrls.addressesByCustomerId}`, { customerId, page, limit });
    }
}
export default new customerService();