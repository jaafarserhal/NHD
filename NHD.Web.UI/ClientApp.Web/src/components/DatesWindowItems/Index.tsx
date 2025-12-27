import React, { useState } from "react";
import { ProductsWithGallery } from "../../api/common/Types";
import QuickView from "../QuickView/Index";
import Product from "../Product/Index";

interface DatesWindowItemsProps {
    informativeData: any[];
    dates: ProductsWithGallery[];
}

const DatesWindowItems: React.FC<DatesWindowItemsProps> = ({
    informativeData,
    dates
}) => {
    if (!dates || dates.length === 0) {
        return null; // or a loading indicator / message
    }

    return (
        <div className="section-padding-01">
            <div className="container">
                <div className="section-title text-center max-width-720 mx-auto">
                    <h2 className="section-title__title text-uppercase">{informativeData?.[0]?.titleEn}</h2>
                    <p>
                        {informativeData?.[0]?.descriptionEn}
                    </p>
                </div>

                <div className="row g-6 gx-lg-10">
                    {dates.slice(0, 3).map((date) => (
                        <Product key={date.id} product={date} />
                    ))}

                    {dates.length === 0 && <p className="text-center">Loading dates...</p>}
                </div>
            </div>
        </div>
    );
};

export default DatesWindowItems;