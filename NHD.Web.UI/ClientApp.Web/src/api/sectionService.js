import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class sectionService extends apiService {
    constructor() {
        super(apiUrls.section);
    }

    async getSectionsByType(typeId, top) {
        return this.get(`${typeId}/${top}`);
    }
}

export default new sectionService();