import apiService from './base/apiService';
import { apiUrls } from './base/apiUrls';

class productService extends apiService {
    constructor() {
        super(apiUrls.products);
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
        formData.append('FromPrice', String(product.fromPrice));
        formData.append('DescriptionEn', product.descriptionEn || '');
        formData.append('DescriptionSv', product.descriptionSv || '');
        formData.append('IsActive', String(product.isActive));

        // Handle dates array properly
        if (product.dates && product.dates.length > 0) {
            product.dates.forEach((date, index) => {
                formData.append(`Dates[${index}].Id`, String(date.id || 0));
                formData.append(`Dates[${index}].PrdId`, String(date.prdId || 0));
                formData.append(`Dates[${index}].DateId`, String(date.dateId));
                formData.append(`Dates[${index}].IsFilled`, String(date.isFilled));
                formData.append(`Dates[${index}].Quantity`, String(date.quantity));
            });
        }

        if (product.imageFile && product.imageFile instanceof File) {
            formData.append('ImageUrl', product.imageFile, product.imageFile.name);
        }

        return this.post(formData, apiUrls.addProduct);
    }

    async updateProduct(product) {
        const formData = new FormData();

        formData.append('Id', String(product.id));
        formData.append('CategoryId', String(product.categoryId));
        formData.append('TypeId', String(product.typeId));
        formData.append('SizeId', String(product.sizeId));
        formData.append('NameEn', product.nameEn || '');
        formData.append('NameSv', product.nameSv || '');
        formData.append('FromPrice', String(product.fromPrice));
        formData.append('DescriptionEn', product.descriptionEn || '');
        formData.append('DescriptionSv', product.descriptionSv || '');
        formData.append('IsActive', String(product.isActive));

        if (product.imageFile && product.imageFile instanceof File) {
            formData.append('ImageUrl', product.imageFile, product.imageFile.name);
        }

        return this.put(formData, apiUrls.updateProduct);
    }

    async getProductById(productId) {
        return this.get(`${apiUrls.getProductById}${productId}`);
    }

    async deleteProduct(productId) {
        return this.delete(`${apiUrls.deleteProduct}${productId}`);
    }

    // Get product categories
    async getCategories() {
        return this.get(apiUrls.categories);
    }
    // Get product types
    async getTypes() {
        return this.get(apiUrls.types);
    }
    // Get product sizes
    async getSizes() {
        return this.get(apiUrls.sizes);
    }
    async getAllDates() {
        return this.get(apiUrls.allDates);
    }
}

export default new productService();