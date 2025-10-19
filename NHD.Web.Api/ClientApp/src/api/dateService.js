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

    async getCollections(page = 1, limit = 10) {
        return this.get(apiUrls.dateCollections, { page, limit });
    }

    async getCollectionById(id) {
        return this.get(`${apiUrls.getDateCollectionById}${id}`);
    }

    async addCollection(collection) {
        const formData = new FormData();

        formData.append('NameEn', collection.nameEn || '');
        formData.append('NameSv', collection.nameSv || '');
        formData.append('DescriptionEn', collection.descriptionEn || '');
        formData.append('DescriptionSv', collection.descriptionSv || '');
        formData.append('IsActive', String(collection.isActive));

        if (collection.imageFile && collection.imageFile instanceof File) {
            formData.append('ImageFile', collection.imageFile, collection.imageFile.name);
        }

        return this.post(formData, apiUrls.addDateCollection);
    }

    async updateCollection(collection) {
        const formData = new FormData();

        formData.append('Id', String(collection.id));
        formData.append('NameEn', collection.nameEn || '');
        formData.append('NameSv', collection.nameSv || '');
        formData.append('DescriptionEn', collection.descriptionEn || '');
        formData.append('DescriptionSv', collection.descriptionSv || '');
        formData.append('IsActive', String(collection.isActive));

        if (collection.imageFile && collection.imageFile instanceof File) {
            formData.append('ImageFile', collection.imageFile, collection.imageFile.name);
        }

        return this.put(formData, apiUrls.updateDateCollection);
    }

    async deleteCollection(collectionId) {
        return this.delete(`${apiUrls.deleteDateCollection}${collectionId}`);
    }

    async getActiveCollections() {
        return this.get(apiUrls.activeCollections);
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