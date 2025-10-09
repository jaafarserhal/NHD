// utils/getImageSrc.js
export const getImageSrc = (path) => {
    if (!path) return '/uploads/placeholder-image.png'; // fallback
    if (path.startsWith('blob:')) return path;          // local preview
    const prefix = process.env.NODE_ENV === 'production' ? '/portal' : '';
    return `${prefix}/uploads/products/${path}`;
};
