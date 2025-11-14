import { SectionType } from "./Enums";

export const getImageSrc = (path, folder) => {
    if (!path) return '/uploads/placeholder-image.png'; // fallback
    if (path.startsWith('blob:')) return path;          // local preview
    const prefix = process.env.NODE_ENV === 'production' ? '/portal' : '';
    return `${prefix}/uploads/${folder}/${path}`;
};

export const getImageResolutionLabel = (value: string): string => {

    switch (value) {
        case SectionType.HomeCarousel.toString():
            return "(1920 x 960)";
            break;
        case SectionType.HomeCallToAction.toString():
            return "(1920 x 696)";
            break;
        default:
            return '';
    }
}