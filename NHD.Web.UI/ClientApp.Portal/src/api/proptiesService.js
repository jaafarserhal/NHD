import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class propertiesService extends apiService {
    constructor() {
        super(apiUrls.properties);
    }

    // Get all properties
    async getProperties(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }

    async getPropertyById(id) {
        return this.get(`${apiUrls.getPropertyById}${id}`);
    }

    async addProperty(propertyData) {
        return this.post(propertyData, apiUrls.addProperty);
    }

    async updateProperty(propertyData) {
        return this.put(propertyData, apiUrls.updateProperty);
    }
}
export default new propertiesService();