import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class faqService extends apiService {
    constructor() {
        super(apiUrls.faqs);
    }

    async getFAQsByType(typeId) {
        return this.get(`${typeId}`);
    }
    async getFaqTypes() {
        return this.get('FaqTypes');
    }
}

export default new faqService();