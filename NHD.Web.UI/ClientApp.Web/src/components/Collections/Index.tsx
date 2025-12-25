import React, { useState, useEffect } from "react";
import { CollectionItem } from "../../api/common/Types";

interface CollectionsProps {
    collections: CollectionItem[];
}

const Collections: React.FC<CollectionsProps> = ({ collections }) => {
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

    // Preload all collection images
    useEffect(() => {
        if (!collections || !collections.length) return;

        collections.forEach((item) => {
            const imageUrl = `${(process.env.REACT_APP_BASE_URL || "")}/uploads/collections/${item.imageUrl}`;
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                setLoadedImages(prev => new Set(prev).add(item.id));
            };
        });
    }, [collections]);

    if (!collections || !collections.length) return null;

    const getImageUrl = (imageUrl: string) => {
        return `${(process.env.REACT_APP_BASE_URL || "")}/uploads/collections/${imageUrl}`;
    };

    return (
        <div className="banner-section">
            <div className="row row-cols-1 row-cols-md-2 g-0">
                {collections.map((item, idx) => {
                    const imageUrl = getImageUrl(item.imageUrl);
                    const isLoaded = loadedImages.has(item.id);

                    return (
                        <div key={item.id} className="col">
                            <a
                                href="shop.html"
                                className="banner-item"
                                style={{
                                    backgroundImage: `url(${imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    opacity: isLoaded ? 1 : 0.9,
                                    transition: 'opacity 0.3s ease-in-out'
                                }}
                            >
                                <div className="banner-item__content">
                                    <h3 className="banner-item__title text-white">
                                        {item.nameEn}
                                    </h3>
                                    <span className="banner-item__btn text-white">
                                        Shop Now
                                    </span>
                                </div>
                                <div className="banner-item__badge text-white">
                                    {String(idx + 1).padStart(2, "0")}.
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Collections;