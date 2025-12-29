export interface Product {
    id?: number;
    nameEn: string;
    nameSv: string;
    descriptionEn: string;
    descriptionSv: string;
    badgeTextEn: string;
    badgeTextSv: string;
    fromPrice: number;
    categoryId: number;
    typeId: number;
    sizeId: number;
    imageUrl: string;
    isActive: boolean;
    isCarousel: boolean;
    dates: DatesProduct[];
    collections: ProductCollection[];
}

export interface Date {
    id?: number;
    nameEn: string;
    nameSv: string;
    quality: boolean;
    unitPrice: number;
    weightPrice: number;
    isFilled: boolean;
    imageUrl: string;
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
    typeId: number;
    isActive: boolean;
}

export interface Faq {
    id?: number;
    questionEn: string;
    questionSv: string;
    answerEn: string;
    answerSv: string;
    typeId: number;
    isActive: boolean;
}

export interface ProductCollection {
    id?: number;
    collectionId: number;
    productId: number;
}
