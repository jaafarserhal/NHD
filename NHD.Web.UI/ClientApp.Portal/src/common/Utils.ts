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
        case SectionType.AboutNawaExperience.toString():
        case SectionType.HomeCustomeGifts.toString():
            return "(1920 x 934)";
            break;
        case SectionType.HomeSubscribe.toString():
            return "(1920 x 326)";
            break;
        case SectionType.AboutMainSection.toString():
            return "(1920 x 720)";
            break;
        case SectionType.ShopMainSection.toString():
        case SectionType.OurDatesMainSection.toString():
            return "(1920 x 370)";
            break;
        case SectionType.AboutWeLoveDates.toString():
            return "(1045 x 781)";
            break;
        default:
            return '';
    }
}
