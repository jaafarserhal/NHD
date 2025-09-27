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
}

export interface LookupItem {
    id: number;
    nameEn: string;
    nameSv: string;
}
