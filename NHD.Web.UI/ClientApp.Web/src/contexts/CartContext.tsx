import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ProductsWithGallery } from '../api/common/Types';
import { storage } from '../api/base/storage';

interface CartItem {
    product: ProductsWithGallery;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: ProductsWithGallery) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: ProductsWithGallery }
    | { type: 'REMOVE_FROM_CART'; payload: number }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartState {
    cartItems: CartItem[];
}

const CART_STORAGE_KEY = 'nhd_cart';
const ENCRYPTION_KEY = 'NHD_2026_CART_SECRET_KEY_EXTENDED_FOR_BETTER_SECURITY';

// Enhanced encryption/decryption functions
const encrypt = (text: string): string => {
    try {
        let result = '';
        const textBytes = new TextEncoder().encode(text);
        const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);

        // Apply multiple layers of encryption
        for (let i = 0; i < textBytes.length; i++) {
            const keyIndex = i % keyBytes.length;
            const encrypted = textBytes[i] ^ keyBytes[keyIndex] ^ (i % 255);
            result += encrypted.toString(16).padStart(2, '0');
        }

        // Add random padding and scramble
        const padding = Math.random().toString(36).substring(2, 8);
        const scrambled = btoa(padding + result + padding);

        // Final layer: reverse and add checksum
        const reversed = scrambled.split('').reverse().join('');
        const checksum = (reversed.length % 255).toString(16).padStart(2, '0');

        return checksum + reversed;
    } catch (error) {
        console.error('Encryption error:', error);
        return btoa(text); // Fallback to simple base64
    }
};

const decrypt = (encryptedText: string): string => {
    try {
        // Extract checksum and reverse
        const checksum = encryptedText.substring(0, 2);
        const reversedData = encryptedText.substring(2);

        // Verify checksum
        const expectedChecksum = (reversedData.length % 255).toString(16).padStart(2, '0');
        if (checksum !== expectedChecksum) {
            throw new Error('Invalid checksum');
        }

        // Reverse and decode
        const scrambled = reversedData.split('').reverse().join('');
        const decoded = atob(scrambled);

        // Remove padding (first 6 and last 6 characters)
        const hexData = decoded.substring(6, decoded.length - 6);

        // Decrypt hex data
        let result = '';
        const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);

        for (let i = 0; i < hexData.length; i += 2) {
            const hexByte = hexData.substring(i, i + 2);
            const encryptedByte = parseInt(hexByte, 16);
            const keyIndex = (i / 2) % keyBytes.length;
            const decrypted = encryptedByte ^ keyBytes[keyIndex] ^ ((i / 2) % 255);
            result += String.fromCharCode(decrypted);
        }

        return result;
    } catch (error) {
        console.error('Decryption error:', error);
        // Fallback: try simple base64 decode
        try {
            return atob(encryptedText);
        } catch {
            return '[]'; // Return empty cart if all fails
        }
    }
};

const loadCartFromStorage = (): CartItem[] => {
    try {
        const storedCart = storage.get(CART_STORAGE_KEY);
        if (storedCart) {
            const decryptedCart = decrypt(storedCart);
            return JSON.parse(decryptedCart);
        }
        return [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
    }
};

const saveCartToStorage = (cartItems: CartItem[]) => {
    try {
        const cartJson = JSON.stringify(cartItems);
        const encryptedCart = encrypt(cartJson);
        storage.set(CART_STORAGE_KEY, encryptedCart);
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existingItem = state.cartItems.find(
                item => item.product.id === action.payload.id
            );
            if (existingItem) {
                return {
                    ...state,
                    cartItems: state.cartItems.map(item =>
                        item.product.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            } else {
                return {
                    ...state,
                    cartItems: [...state.cartItems, { product: action.payload, quantity: 1 }],
                };
            }
        }
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartItems: state.cartItems.filter(item => item.product.id !== action.payload),
            };
        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                return {
                    ...state,
                    cartItems: state.cartItems.filter(
                        item => item.product.id !== action.payload.productId
                    ),
                };
            }
            return {
                ...state,
                cartItems: state.cartItems.map(item =>
                    item.product.id === action.payload.productId
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        }
        case 'CLEAR_CART':
            return {
                ...state,
                cartItems: [],
            };
        case 'LOAD_CART':
            return {
                ...state,
                cartItems: action.payload,
            };
        default:
            return state;
    }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, {
        cartItems: [],
    });

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = loadCartFromStorage();
        if (savedCart.length > 0) {
            dispatch({ type: 'LOAD_CART', payload: savedCart });
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        saveCartToStorage(state.cartItems);
    }, [state.cartItems]);

    const addToCart = (product: ProductsWithGallery) => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    const removeFromCart = (productId: number) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };

    const updateQuantity = (productId: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getTotalItems = () => {
        return state.cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return state.cartItems.reduce((total, item) =>
            total + (item.product.fromPrice || 0) * item.quantity, 0
        );
    };

    const value: CartContextType = {
        cartItems: state.cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};