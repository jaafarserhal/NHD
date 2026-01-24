// Google Sign-In utility functions and types
export interface GoogleSignInResponse {
    credential: string;
    select_by: string;
}

export interface GoogleUserInfo {
    sub: string;        // Google user ID
    name: string;       // Full name
    given_name: string; // First name
    family_name: string; // Last name
    picture: string;    // Profile picture URL
    email: string;      // Email address
    email_verified: boolean;
    locale?: string;
}

export interface GoogleSignInConfig {
    client_id: string;
    callback: (response: GoogleSignInResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
}

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: GoogleSignInConfig) => void;
                    prompt: () => void;
                    renderButton: (parent: HTMLElement, options: any) => void;
                    disableAutoSelect: () => void;
                };
            };
        };
    }
}

export class GoogleSignInManager {
    private static isLoaded = false;
    private static config: GoogleSignInConfig;
    private static isInitialized = false;

    static async loadGoogleSDK(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isLoaded || window.google) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;

            // Set up timeout to handle loading failures
            const timeout = setTimeout(() => {
                reject(new Error('Google Sign-In SDK loading timeout'));
            }, 10000);

            script.onload = () => {
                clearTimeout(timeout);
                this.isLoaded = true;
                // Wait a bit for the SDK to fully initialize
                setTimeout(() => resolve(), 100);
            };

            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Failed to load Google Sign-In SDK'));
            };

            document.head.appendChild(script);
        });
    }

    static async initialize(config: GoogleSignInConfig): Promise<void> {
        try {
            await this.loadGoogleSDK();

            // Enhanced config with FedCM disabled to avoid AbortError
            const enhancedConfig = {
                ...config,
                use_fedcm_for_prompt: false,  // Disable FedCM to prevent AbortError
                cancel_on_tap_outside: true,
                auto_select: false
            };

            this.config = enhancedConfig;

            if (window.google && window.google.accounts && window.google.accounts.id) {
                window.google.accounts.id.initialize(enhancedConfig);
                this.isInitialized = true;
                console.log('Google Sign-In initialized successfully');
            } else {
                throw new Error('Google Sign-In SDK not properly loaded');
            }
        } catch (error) {
            console.error('Google Sign-In initialization error:', error);
            throw error;
        }
    }

    static renderButton(element: HTMLElement, options: any = {}): void {
        if (!window.google || !this.isInitialized) {
            throw new Error('Google Sign-In SDK not loaded or initialized');
        }

        const defaultOptions = {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            logo_alignment: 'left',
            type: 'standard'
        };

        window.google.accounts.id.renderButton(element, { ...defaultOptions, ...options });
    }

    static async promptWithErrorHandling(): Promise<void> {
        if (!window.google || !this.isInitialized) {
            throw new Error('Google Sign-In SDK not loaded or initialized');
        }

        try {
            console.log('Prompting Google Sign-In...');
            // Disable auto-select first to prevent conflicts
            window.google.accounts.id.disableAutoSelect();

            // Use the standard prompt method
            window.google.accounts.id.prompt();

        } catch (error) {
            console.error('Google Sign-In prompt error:', error);
            throw new Error('Google Sign-In failed. Please try again.');
        }
    }

    static prompt(): void {
        if (!window.google || !this.isInitialized) {
            console.error('Google Sign-In not properly initialized');
            throw new Error('Google Sign-In SDK not loaded or initialized');
        }

        try {
            console.log('Standard Google prompt...');
            window.google.accounts.id.prompt();
        } catch (error) {
            console.error('Google prompt error:', error);
        }
    }

    static disableAutoSelect(): void {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    }

    static parseJWT(token: string): GoogleUserInfo {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const parsed = JSON.parse(jsonPayload);

            // Validate required fields
            if (!parsed.sub || !parsed.email) {
                throw new Error('Invalid token: missing required fields');
            }

            return parsed;
        } catch (error) {
            console.error('JWT parsing error:', error);
            throw new Error('Invalid JWT token');
        }
    }
}