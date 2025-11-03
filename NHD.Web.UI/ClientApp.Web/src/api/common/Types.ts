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
    fromPrice: number;
    imageUrl: string;
    type: string;
    size: string;
    galleries: GalleryViewModel[];
}

export interface GalleryViewModel {
    id: number;
    altText: string;
    imageUrl: string;
}
