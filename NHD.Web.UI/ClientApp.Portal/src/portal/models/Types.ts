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
    isCarousel: boolean;
    dates: DatesProduct[];
}

export interface Date {
    id?: number;
    collectionId: number;
    nameEn: string;
    nameSv: string;
    quality: boolean;
    unitPrice: number;
    weightPrice: number;
    isActive: boolean;
}

export interface DatesCollection {
    id?: number;
    nameEn: string;
    nameSv: string;
    imageUrl: string;
    descriptionEn: string;
    descriptionSv: string;
    isActive: boolean;
}

export interface DatesProduct {
    id?: number;
    prdId: number;
    dateId: number;
    quantity: number;
    isFilled: boolean;
    isPerWeight: boolean;
}

export interface Gallery {
    prdId?: number;
    dateId?: number;
    imageUrl: string;
    altText: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface LookupItem {
    id: number;
    nameEn: string;
    nameSv: string;
}

export interface Section {
    id?: number;
    titleEn: string;
    titleSv: string;
    descriptionEn: string;
    descriptionSv: string;
    ImageFile: string;
    isActive: boolean;
}
