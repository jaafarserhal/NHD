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
}

export default new homeService();