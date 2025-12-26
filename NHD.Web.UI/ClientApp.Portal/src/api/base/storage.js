const APP_PREFIX = 'PORTAL_' // or 'WEB_'

export const storage = {
    set(key, value) {
        localStorage.setItem(`${APP_PREFIX}${key}`, value);
    },
    get(key) {
        return localStorage.getItem(`${APP_PREFIX}${key}`);
    },
    remove(key) {
        localStorage.removeItem(`${APP_PREFIX}${key}`);
    },
    clearApp() {
        Object.keys(localStorage)
            .filter(k => k.startsWith(APP_PREFIX))
            .forEach(k => localStorage.removeItem(k));
    }
};