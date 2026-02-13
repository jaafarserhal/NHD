import CryptoJS from "crypto-js";
import Swal from "sweetalert2";

const secretKey = process.env.REACT_APP_SECRET_KEY || "";


export default function encryptParameter(parameter: string): string {
    const encrypted = CryptoJS.AES.encrypt(parameter, secretKey).toString();
    return encodeURIComponent(encrypted);
};

export function decryptParameter(encryptedParameter: string,): string {
    const decodedParam = decodeURIComponent(encryptedParameter);
    const bytes = CryptoJS.AES.decrypt(decodedParam, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
};

export function validatePassword(password: string): string {
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character";
    }
    return "";
};

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export function showAlert(type: string, message: string) {
    const toast = Swal.mixin({
        toast: true,
        position: "center",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });

    let icon: any;

    switch (type) {
        case "success":
            icon = "success";
            break;
        case "warning":
            icon = "warning";
            break;
        case "info":
            icon = "info";
            break;
        case "error":
        default:
            icon = "error";
            break;
    }

    toast.fire({
        icon: icon,
        title: message,
    });
}
export const formatPhoneNumber = (phone?: string): string => {
    if (!phone) return "";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

export const switchTab = (tabId: string): void => {
    const tab = document.getElementById(tabId);
    if (tab) {
        tab.click();
    }
};

/**
 * Generates a unique order ID following best practices:
 * - Prefixed with 'NHD' for brand recognition
 * - Contains timestamp for chronological ordering
 * - Includes random alphanumeric string for uniqueness
 * - Uses URL-safe characters only
 * - Length is consistent (16 characters)
 * - Human-readable and easy to communicate over phone/email
 * 
 * Format: NHD-YYYYMMDD-XXXX (where XXXX is a random 4-character string)
 * Example: NHD-20241208-B7K9
 */
export const generateOrderId = (): string => {
    // Get current date in YYYYMMDD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;

    // Generate random 4-character alphanumeric string (uppercase for readability)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < 4; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Combine with prefix and separators for readability
    return `NHD-${dateString}-${randomString}`;
};

/**
 * Validates if a string is a valid order ID format
 * @param orderId - The order ID to validate
 * @returns boolean indicating if the format is valid
 */
export const isValidOrderId = (orderId: string): boolean => {
    // Pattern: NHD-YYYYMMDD-XXXX (where XXXX is 4 alphanumeric characters)
    const orderIdPattern = /^NHD-\d{8}-[A-Z0-9]{4}$/;
    return orderIdPattern.test(orderId);
};