import apiService from './base/apiService';

class productService extends apiService {
    constructor() {
        super('/products');
    }

    // Get all products
    async getProducts(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }

    async addProduct(product) {
        const formData = new FormData();

        formData.append('CategoryId', String(product.categoryId));
        formData.append('TypeId', String(product.typeId));
        formData.append('SizeId', String(product.sizeId));
        formData.append('NameEn', product.nameEn || '');
        formData.append('NameSv', product.nameSv || '');
        formData.append('DescriptionEn', product.descriptionEn || '');
        formData.append('DescriptionSv', product.descriptionSv || '');
        formData.append('Price', String(product.price));
        formData.append('IsActive', String(product.isActive));

        if (product.imageFile && product.imageFile instanceof File) {
            formData.append('ImageUrl', product.imageFile, product.imageFile.name);
        }

        return this.post(formData, 'Add');
    }

    // Get product categories
    async getCategories() {
        return this.get('/Categories');
    }
    // Get product types
    async getTypes() {
        return this.get('/Types');
    }
    // Get product sizes
    async getSizes() {
        return this.get('/Sizes');
    }
}

export default new productService();