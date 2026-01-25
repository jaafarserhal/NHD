import apiClient from "../base/apiClient";


export interface CartItemResponse {
    product: any; // Use your ProductsWithGallery interface
    quantity: number;
}

export interface CartResponse {
    cartId: number;
    customerId: number;
    cartItems: CartItemResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface SyncCartItem {
    productId: number;
    quantity: number;
}

class CartApi {
    private readonly baseUrl = '/cart';

    async getCart(): Promise<CartResponse | null> {
        try {
            const response = await apiClient.get<CartResponse>(this.baseUrl);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No cart exists yet
            }
            throw error;
        }
    }

    async addToCart(productId: number, quantity: number = 1): Promise<CartResponse> {
        const response = await apiClient.post<CartResponse>(`${this.baseUrl}/add`, {
            productId,
            quantity,
        });
        return response.data;
    }

    async updateQuantity(productId: number, quantity: number): Promise<CartResponse> {
        const response = await apiClient.put<CartResponse>(`${this.baseUrl}/update`, {
            productId,
            quantity,
        });
        return response.data;
    }

    async removeFromCart(productId: number): Promise<CartResponse> {
        const response = await apiClient.delete<CartResponse>(`${this.baseUrl}/remove/${productId}`);
        return response.data;
    }

    async clearCart(): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/clear`);
    }

    async syncCart(localCartItems: SyncCartItem[]): Promise<CartResponse> {
        const response = await apiClient.post<CartResponse>(`${this.baseUrl}/sync`, {
            cartItems: localCartItems,
        });
        return response.data;
    }
}

export const cartApi = new CartApi();