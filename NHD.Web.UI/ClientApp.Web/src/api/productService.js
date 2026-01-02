import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class productService extends apiService {
    constructor() {
        super(apiUrls.product);
    }

    async getAllProducts(page = 1, limit = 10, category = 0, search = "") {
        const params = { page, limit, category, search };
        return this.get('AllProductsByCategory', params);
    }
    async getCategories() {
        return this.get('Categories');
    }
}

export default new productService();