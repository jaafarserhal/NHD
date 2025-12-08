import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_SECRET_KEY || "";
export default function encryptParameter(parameter: string): string {
    const encrypted = CryptoJS.AES.encrypt(parameter, secretKey).toString();
    return encodeURIComponent(encrypted);
}

export function decryptParameter(encryptedParameter: string,): string {
    const decodedParam = decodeURIComponent(encryptedParameter);
    const bytes = CryptoJS.AES.decrypt(decodedParam, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
}