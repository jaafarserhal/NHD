export interface Product {
    id?: number;
    nameEn: string;
    nameSv: string;
    descriptionEn: string;
    descriptionSv: string;
    fromPrice: number;
    categoryId: number;
    typeId: number;
    sizeId: number;
    imageUrl: string;
    isActive: boolean;
    dates: DatesProduct[];
}

export interface Date {
    id?: number;
    nameEn: string;
    nameSv: string;
    quality: boolean;
    unitPrice: number;
    weightPrice: number;
    isActive: boolean;
}

export interface DatesProduct {
    id?: number;
    prdId: number;
    dateId: number;
    quantity: number;
    isFilled: boolean;
}

export interface ProductGallery {
    prdId?: number;
    imageUrl: string;
    altText: string;
    sortOrder: number;
}

export interface LookupItem {
    id: number;
    nameEn: string;
    nameSv: string;
}
