import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class homeService extends apiService {
    constructor() {
        super(apiUrls.homepage);
    }

    async getCarousel() {
        return this.get('Carousel');
    }
    async getSignatureGiftsProducts() {
        return this.get(`SignatureGiftsProducts`);
    }
}

export default new homeService();