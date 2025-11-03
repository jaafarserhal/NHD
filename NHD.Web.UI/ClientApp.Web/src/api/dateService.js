import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class dateService extends apiService {
    constructor() {
        super(apiUrls.dates);
    }

    // Get all dates
    async getDates(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }

    async addDate(date) {
        return this.post(date, apiUrls.addDate);
    }

    async updateDate(date) {
        return this.put(date, apiUrls.updateDate);
    }

    async getDateById(dateId) {
        return this.get(`${apiUrls.getDateById}${dateId}`);
    }
    async deleteDate(dateId) {
        return this.delete(`${apiUrls.deleteDate}${dateId}`);
    }

}

export default new dateService();