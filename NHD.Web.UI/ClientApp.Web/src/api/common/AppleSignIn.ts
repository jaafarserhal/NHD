// Apple Sign-In utility functions and types
export interface AppleSignInResponse {
    authorization: {
        code: string;
        id_token: string;
        state?: string;
    };
    user?: {
        email: string;
        name?: {
            firstName: string;
            lastName: string;
        };
    };
}

export interface AppleSignInConfig {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    nonce?: string;
    usePopup?: boolean;
}

declare global {
    interface Window {
        AppleID: {
            auth: {
                init: (config: AppleSignInConfig) => void;
                signIn: (config?: Partial<AppleSignInConfig>) => Promise<AppleSignInResponse>;
            };
        };
    }
}

export class AppleSignInManager {
    private static isLoaded = false;
    private static config: AppleSignInConfig;

    static async loadAppleSDK(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isLoaded || window.AppleID) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
            script.async = true;
            script.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Apple Sign-In SDK'));
            };
            document.head.appendChild(script);
        });
    }

    static async initialize(config: AppleSignInConfig): Promise<void> {
        await this.loadAppleSDK();
        this.config = config;
        window.AppleID.auth.init(config);
    }

    static async signIn(): Promise<AppleSignInResponse> {
        if (!window.AppleID) {
            throw new Error('Apple Sign-In SDK not loaded');
        }
        return window.AppleID.auth.signIn(this.config);
    }

    static generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}