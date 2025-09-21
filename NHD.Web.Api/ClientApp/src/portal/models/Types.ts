export interface Product {
    id?: number;
    nameEN: string;
    nameSV: string;
    descriptionEN: string;
    descriptionSV: string;
    categoryId: number;
    typeId: number;
    sizeId: number;
    imageUrl: string;
    price: number;
    isActive: boolean;
}
