import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class homeService extends apiService {
    constructor() {
        super(apiUrls.homepage);
    }

    async getHomeSlider() {
        return this.get('HomeSlider');
    }
    async getSignatureGiftsProducts() {
        return this.get(`SignatureGiftsProducts`);
    }

    async getCallToActionSection() {
        return this.get('HomeCallToActionSection');
    }

    async getBrands() {
        return this.get('TopFiveDatesWithGalleries');
    }
    async getTop4Collections() {
        return this.get('Top4Collections');
    }
}

export default new homeService();