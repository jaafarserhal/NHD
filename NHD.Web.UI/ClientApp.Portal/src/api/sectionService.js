import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class sectionService extends apiService {
    constructor() {
        super(apiUrls.sections);
    }

    // Get all sections
    async getSections(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }

    async addSection(section) {
        const formData = new FormData();

        formData.append('TitleEn', section.titleEn || '');
        formData.append('TitleSv', section.titleSv || '');
        formData.append('DescriptionEn', section.descriptionEn || '');
        formData.append('DescriptionSv', section.descriptionSv || '');
        formData.append('IsActive', String(section.isActive));
        formData.append('IsHomeSlider', String(section.isHomeSlider));

        if (section.imageFile && section.imageFile instanceof File) {
            formData.append('ImageFile', section.imageFile, section.imageFile.name);
        }

        return this.post(formData, apiUrls.addSection);
    }

    async updateSection(section) {
        const formData = new FormData();

        formData.append('Id', String(section.id));
        formData.append('TitleEn', section.titleEn || '');
        formData.append('TitleSv', section.titleSv || '');
        formData.append('DescriptionEn', section.descriptionEn || '');
        formData.append('DescriptionSv', section.descriptionSv || '');
        formData.append('IsActive', String(section.isActive));
        formData.append('IsHomeSlider', String(section.isHomeSlider));

        if (section.imageFile && section.imageFile instanceof File) {
            formData.append('ImageFile', section.imageFile, section.imageFile.name);
        }

        return this.put(formData, apiUrls.updateSection);
    }

    async getSectionById(sectionId) {
        return this.get(`${apiUrls.getSectionById}${sectionId}`);
    }

    async deleteSection(sectionId) {
        return this.delete(`${apiUrls.deleteSection}${sectionId}`);
    }
}

export default new sectionService();