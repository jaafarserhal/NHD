import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class productService extends apiService {
    constructor() {
        super(apiUrls.homepage);
    }

    async getCarouselProducts() {
        return this.get('carousel-products');
    }
}

export default new productService();