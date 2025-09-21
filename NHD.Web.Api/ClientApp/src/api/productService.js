import apiService from './base/apiService';

class productService extends apiService {
    constructor() {
        super('/products');
    }

    // Get all products
    async getProducts(page = 1, limit = 10) {
        return this.get('', { page, limit });
    }
    // Add a new product
    async addProduct(product) {
        const formData = new FormData();
        formData.append('CategoryId', product.categoryId);
        formData.append('TypeId', product.typeId);
        formData.append('SizeId', product.sizeId);
        formData.append('NameEN', product.nameEN);
        formData.append('NameSV', product.nameSV);
        formData.append('DescriptionEN', product.descriptionEN);
        formData.append('DescriptionSV', product.descriptionSV);
        formData.append('Price', product.price.toString());
        formData.append('IsActive', product.isActive.toString());
        if (product.image) {
            formData.append('ImageUrl', product.image);
        }
        return this.post('/Add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}

export default new productService();