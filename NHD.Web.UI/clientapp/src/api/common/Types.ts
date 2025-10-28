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
