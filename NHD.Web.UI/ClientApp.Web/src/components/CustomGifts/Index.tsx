import React from "react";

interface CustomGiftsProps {
    informativeData: any[];
}

const CustomGifts: React.FC<CustomGiftsProps> = ({ informativeData }) => {
    if (!informativeData || informativeData.length === 0) return null;
    const section = informativeData[0];
    return (
        <div
            className="call-to-action-02 section-padding-01"
            style={{ backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${section.imageUrl})` }}
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
export default CustomGifts;