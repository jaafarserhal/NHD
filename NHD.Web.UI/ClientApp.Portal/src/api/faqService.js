import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class faqService extends apiService {
    constructor() {
        super(apiUrls.faqs);
    }

    // Get all FAQs
    async getFaqs(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }

    async getFaqById(id) {
        return this.get(`${apiUrls.getFaqById}${id}`);
    }

    async addFaq(faqData) {
        return this.post(faqData, apiUrls.addFaq);
    }

    async updateFaq(faqData) {
        return this.put(faqData, apiUrls.updateFaq);
    }

    async deleteFaq(faqId) {
        return this.delete(`${apiUrls.deleteFaq}${faqId}`);
    }

    async getFaqTypes() {
        return this.get(apiUrls.getFaqTypes);
    }
}
export default new faqService();