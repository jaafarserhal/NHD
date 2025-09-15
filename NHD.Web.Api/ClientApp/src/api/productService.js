import apiService from './base/apiService';

class productService extends apiService {
    constructor() {
        super('/products');
    }

    // Get all products
    async getProducts(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }
}

export default new productService();