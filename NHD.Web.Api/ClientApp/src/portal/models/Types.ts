export interface Product {
    id?: number;
    nameEn: string;
    nameSv: string;
    descriptionEn: string;
    descriptionSv: string;
    categoryId: number;
    typeId: number;
    sizeId: number;
    imageUrl: string;
    price: number;
    isActive: boolean;
}

export interface LookupItem {
    id: number;
    nameEn: string;
    nameSv: string;
}
