export interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
    badge?: string;
    isHot?: boolean;
}

export interface MenuItem {
    label: string;
    href: string;
    subItems?: MenuItem[];
}

export interface ProductsWithGallery {
    id: number;
    titleEn: string;
    titleSv: string;
    descriptionEn: string;
    descriptionSv: string;
    badgeTextEn: string;
    badgeTextSv: string;
    fromPrice: number;
    imageUrl: string;
    type: string;
    size: string;
    categoryId: number;
    galleries: GalleryViewModel[];
}

export interface GalleryViewModel {
    id: number;
    altText: string;
    imageUrl: string;
    isPrimary: boolean;
}

export interface BrandItem {
    id: number;
    nameEn: string;
    nameSv: string;
    imageUrl: string;
    altText: string;
}

export interface CollectionItem {
    id: number;
    nameEn: string;
    nameSv: string;
    imageUrl: string;
}

export interface LookupItem {
    id: number;
    nameEn: string;
    nameSv: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    message?: string;
    user: {
        email: string;
        firstName: string;
        lastName: string;
    }
}

export interface CustomerInfo {
    email: string;
    firstName: string;
    lastName: string;
    mobile: string;
    addresses: Address[];
}

export interface Address {
    id: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    streetName?: string;
    streetNumber?: string;
    postalCode?: string;
    city?: string;
    type?: string;
    typeId?: number;
    isPrimary?: boolean;
}

export interface ContactMessage {
    subjectId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
}

export interface FAQ {
    id: number;
    questionEn: string;
    questionSv: string;
    answerEn: string;
    answerSv: string;
    typeId: number;
    type: string;
    isActive: boolean;
}

export interface ProductsResponse {
    data: ProductsWithGallery[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}