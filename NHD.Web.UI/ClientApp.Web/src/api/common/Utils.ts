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
