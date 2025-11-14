import React from "react";
import { CollectionItem } from "../../api/common/Types";

interface CollectionsProps {
    collections: CollectionItem[];
}

const Collections: React.FC<CollectionsProps> = ({ collections }) => {
    console.log('Collections component received:', collections);
    if (!collections || !collections.length) return null;

    return (
        <div className="banner-section">
            <div className="row row-cols-1 row-cols-md-2 g-0">
                {collections.map((item, idx) => (
                    <div key={item.id} className="col">
                        <a
                            href="shop.html"
                            className="banner-item"
                            style={{ backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "") + `/uploads/collections/${item.imageUrl}`})` }}
                        >
                            <div className="banner-item__content">
                                <h3 className="banner-item__title text-white">{item.nameEn}</h3>
                                <span className="banner-item__btn text-white">Shop Now</span>
                            </div>
                            <div className="banner-item__badge text-white">
                                {String(idx + 1).padStart(2, "0")}.
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Collections;
