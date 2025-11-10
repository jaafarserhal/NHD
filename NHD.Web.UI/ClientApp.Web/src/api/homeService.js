import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class homeService extends apiService {
    constructor() {
        super(apiUrls.homepage);
    }

    async getSectionsByType(typeId, top) {
        return this.get(`Section/${typeId}/${top}`);
    }

    async getSignatureGiftsProducts() {
        return this.get(`SignatureGiftsProducts`);
    }

    async getBrands() {
        return this.get('TopFiveDatesWithGalleries');
    }
    async getTop4Collections() {
        return this.get('Top4Collections');
    }
}

export default new homeService();