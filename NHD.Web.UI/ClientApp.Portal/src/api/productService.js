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
        formData.append('Quantity', String(product.quantity));
        formData.append('DescriptionEn', product.descriptionEn || '');
        formData.append('DescriptionSv', product.descriptionSv || '');
        formData.append('BadgeTextEn', product.badgeTextEn || '');
        formData.append('BadgeTextSv', product.badgeTextSv || '');
        formData.append('IsCarousel', String(product.isCarousel));
        formData.append('IsActive', String(product.isActive));

        // Handle dates array properly
        if (product.dates && product.dates.length > 0) {
            product.dates.forEach((date, index) => {
                formData.append(`Dates[${index}].Id`, String(date.id || 0));
                formData.append(`Dates[${index}].PrdId`, String(date.prdId || 0));
                formData.append(`Dates[${index}].DateId`, String(date.dateId));
                formData.append(`Dates[${index}].IsFilled`, String(date.isFilled));
                formData.append(`Dates[${index}].Quantity`, String(date.quantity));
                formData.append(`Dates[${index}].IsPerWeight`, String(date.isPerWeight));
            });
        }

        if (product.collections && product.collections.length > 0) {
            product.collections.forEach((collection, index) => {
                formData.append(`Collections[${index}].Id`, String(collection.id || 0));
                formData.append(`Collections[${index}].ProductId`, String(collection.productId || 0));
                formData.append(`Collections[${index}].CollectionId`, String(collection.collectionId));
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
        formData.append('Quantity', String(product.quantity));
        formData.append('FromPrice', String(product.fromPrice));
        formData.append('DescriptionEn', product.descriptionEn || '');
        formData.append('DescriptionSv', product.descriptionSv || '');
        formData.append('BadgeTextEn', product.badgeTextEn || '');
        formData.append('BadgeTextSv', product.badgeTextSv || '');
        formData.append('IsActive', String(product.isActive));
        formData.append('IsCarousel', String(product.isCarousel));

        // ✅ Add proper handling for dates array (same as addProduct)
        if (product.dates && product.dates.length > 0) {
            product.dates.forEach((date, index) => {
                formData.append(`Dates[${index}].Id`, String(date.id || 0));
                formData.append(`Dates[${index}].PrdId`, String(date.prdId));
                formData.append(`Dates[${index}].DateId`, String(date.dateId));
                formData.append(`Dates[${index}].IsFilled`, String(date.isFilled || false));
                formData.append(`Dates[${index}].Quantity`, String(date.quantity || 0));
                formData.append(`Dates[${index}].IsPerWeight`, String(date.isPerWeight || false));
            });
        }

        if (product.collections && product.collections.length > 0) {
            product.collections.forEach((collection, index) => {
                formData.append(`Collections[${index}].Id`, String(collection.id || 0));
                formData.append(`Collections[${index}].ProductId`, String(collection.productId || 0));
                formData.append(`Collections[${index}].CollectionId`, String(collection.collectionId));
            });
        }

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
    async getGallery(productId, dateId, page = 1, limit = 10) {
        let id = productId ? productId : dateId;
        let type = productId ? 'product' : 'date';
        return this.get(`${apiUrls.gallery}${id}/${type}`, { page, limit });
    }
    async addGallery(gallery) {
        const formData = new FormData();
        if (gallery.prdId) {
            formData.append('PrdId', String(gallery.prdId));
        }
        if (gallery.dateId) {
            formData.append('DateId', String(gallery.dateId));
        }
        formData.append('AltText', gallery.altText || '');
        formData.append('SortOrder', String(gallery.sortOrder || 0));
        formData.append('IsPrimary', String(gallery.isPrimary || false));
        if (gallery.imageFile && gallery.imageFile instanceof File) {
            formData.append('ImageUrl', gallery.imageFile, gallery.imageFile.name);
        }
        return this.post(formData, apiUrls.addGallery);
    }
    async deleteGallery(galleryId) {
        return this.delete(`${apiUrls.deleteGallery}${galleryId}`);
    }

    async getActiveCollections() {
        return this.get(apiUrls.activeCollections);
    }
}

export default new productService();