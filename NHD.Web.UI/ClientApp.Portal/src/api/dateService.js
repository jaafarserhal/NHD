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

    async addDate(date) {
        const formData = new FormData();
        formData.append('NameEn', date.nameEn || '');
        formData.append('NameSv', date.nameSv || '');
        formData.append('Quality', String(date.quality));
        formData.append('UnitPrice', String(date.unitPrice));
        formData.append('WeightPrice', String(date.weightPrice));
        formData.append('DescriptionEn', date.descriptionEn || '');
        formData.append('DescriptionSv', date.descriptionSv || '');
        formData.append('IsFilled', String(date.isFilled));
        formData.append('IsActive', String(date.isActive));

        if (date.additionalInfos && Array.isArray(date.additionalInfos)) {
            date.additionalInfos.forEach((info, index) => {
                formData.append(`AdditionalInfos[${index}].Id`, String(info.id || 0));
                formData.append(`AdditionalInfos[${index}].DateId`, String(info.dateId));
                formData.append(`AdditionalInfos[${index}].KeyEn`, info.keyEn || '');
                formData.append(`AdditionalInfos[${index}].ValueEn`, info.valueEn || '');
                formData.append(`AdditionalInfos[${index}].KeySv`, info.keySv || '');
                formData.append(`AdditionalInfos[${index}].ValueSv`, info.valueSv || '');
            });
        }

        if (date.imageFile && date.imageFile instanceof File) {
            formData.append('ImageFile', date.imageFile, date.imageFile.name);
        }

        return this.post(formData, apiUrls.addDate);
    }

    async updateDate(date) {
        const formData = new FormData();
        formData.append('Id', String(date.id));
        formData.append('NameEn', date.nameEn || '');
        formData.append('NameSv', date.nameSv || '');
        formData.append('Quality', String(date.quality));
        formData.append('UnitPrice', String(date.unitPrice));
        formData.append('WeightPrice', String(date.weightPrice));
        formData.append('DescriptionEn', date.descriptionEn || '');
        formData.append('DescriptionSv', date.descriptionSv || '');
        formData.append('IsFilled', String(date.isFilled));
        formData.append('IsActive', String(date.isActive));

        if (date.additionalInfos && Array.isArray(date.additionalInfos)) {
            date.additionalInfos.forEach((info, index) => {
                formData.append(`AdditionalInfos[${index}].Id`, String(info.id || 0));
                formData.append(`AdditionalInfos[${index}].DateId`, String(info.dateId));
                formData.append(`AdditionalInfos[${index}].KeyEn`, info.keyEn || '');
                formData.append(`AdditionalInfos[${index}].ValueEn`, info.valueEn || '');
                formData.append(`AdditionalInfos[${index}].KeySv`, info.keySv || '');
                formData.append(`AdditionalInfos[${index}].ValueSv`, info.valueSv || '');
            });
        }

        if (date.imageFile && date.imageFile instanceof File) {
            formData.append('ImageFile', date.imageFile, date.imageFile.name);
        }

        return this.put(formData, apiUrls.updateDate);
    }

    async getDateById(dateId) {
        return this.get(`${apiUrls.getDateById}${dateId}`);
    }
    async deleteDate(dateId) {
        return this.delete(`${apiUrls.deleteDate}${dateId}`);
    }

}

export default new dateService();