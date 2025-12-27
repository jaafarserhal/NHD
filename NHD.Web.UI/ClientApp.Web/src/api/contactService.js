import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class contactService extends apiService {
    constructor() {
        super(apiUrls.contact);
    }

    async submitContact(model) {
        return this.post(model, apiUrls.submitContact);
    }
    async getSubjects() {
        return this.get(apiUrls.subjects);
    }
}

export default new contactService();