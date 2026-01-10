import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class dateService extends apiService {
    constructor() {
        super(apiUrls.dates);
    }

    // Get all dates
    async getDates(page = 1, limit = 10) {
        return this.get('AllDates', { page, limit });
    }

    // Get date by ID
    async getDatesDetails(datesId) {
        return this.get(`DatesDetails/${datesId}`);
    }
}

export default new dateService();