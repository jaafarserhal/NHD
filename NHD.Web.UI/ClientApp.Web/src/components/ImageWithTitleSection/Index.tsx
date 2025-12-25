import React, { useEffect } from "react";

interface CustomGiftsProps {
    informativeData: any[];
}

const ImageWithTitleSection: React.FC<CustomGiftsProps> = ({ informativeData }) => {
    if (!informativeData || informativeData.length === 0) return null;
    const section = informativeData[0];
    const [bannerImageLoaded, setBannerImageLoaded] = React.useState(false);
    // Preload banner image when data is available
    useEffect(() => {
        if (section?.imageUrl) {
            const img = new Image();
            img.src = `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${section.imageUrl}`;
            img.onload = () => setBannerImageLoaded(true);
        }
    }, [section?.imageUrl]);
    return (
        <div
            className="call-to-action-02 section-padding-01"
            style={{
                backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${section.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: bannerImageLoaded ? 1 : 0.9,
                transition: 'opacity 0.3s ease-in-out'
            }}
        >
            <div className="call-to-action-02-wrapper section-padding-01">
                <div className="container">
                    <div className="call-to-action-02-content text-center">
                        <h2 className="call-to-action-02-content__title text-white mt-1">
                            {section.titleEn}
                        </h2>
                        <p className="mt-6 text-white">
                            {section.descriptionEn}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ImageWithTitleSection;