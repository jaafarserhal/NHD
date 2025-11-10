import React, { useEffect } from "react";
import homeService from "../../api/homeService";
import { CollectionItem } from "../../api/common/Types";

const Collections: React.FC = () => {
    const [collectionData, setCollectionData] = React.useState<CollectionItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await homeService.getTop4Collections();

                // Make sure it's an array before mapping
                if (Array.isArray(response)) {
                    const mapped = response.map((collection: any) => ({
                        id: collection.id,
                        nameEn: collection.nameEn,
                        nameSv: collection.nameSv,
                        imageUrl: (process.env.REACT_APP_BASE_URL || "") + `/uploads/collections/${collection.imageUrl}`,
                    }));

                    setCollectionData(mapped);
                } else {
                    setCollectionData([]);
                    console.warn("Collections response is not an array:", response);
                }

            } catch (error) {
                console.error("Error fetching collections:", error);
                setCollectionData([]);
            }
        };

        fetchData();
    }, []);

    if (!collectionData.length) return null;

    return (
        <div className="banner-section">
            <div className="row row-cols-1 row-cols-md-2 g-0">
                {collectionData.map((item, idx) => (
                    <div key={item.id} className="col">
                        <a
                            href="shop.html"
                            className="banner-item"
                            style={{ backgroundImage: `url(${item.imageUrl})` }}
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
