import React, { useState } from "react";
import { ProductsWithGallery } from "../../api/common/Types";
import QuickView from "./QuickView";
import Product from "../Product/Index";

interface CategoryTopProductProps {
    informativeData: any[];
    products: ProductsWithGallery[];
}

const CategoryTopProduct: React.FC<CategoryTopProductProps> = ({
    informativeData,
    products
}) => {
    if (!products || products.length === 0) {
        return null; // or a loading indicator / message
    }

    const [selectedProduct, setSelectedProduct] = useState<ProductsWithGallery | null>(null);

    const handleQuickView = (product: ProductsWithGallery) => {
        setSelectedProduct(product);
    };

    return (
        <div className="section-padding-01">
            <div className="container">
                <div className="section-title text-center max-width-720 mx-auto">
                    <h2 className="section-title__title">{informativeData?.[0]?.titleEn}</h2>
                    <p>
                        {informativeData?.[0]?.descriptionEn}
                    </p>
                </div>

                <div className="row g-6 gx-lg-10">
                    {products.slice(0, 3).map((product) => (
                        <Product key={product.id} product={product} onQuickView={handleQuickView} isByCategory={true} />
                    ))}

                    {products.length === 0 && <p className="text-center">Loading products...</p>}
                </div>
            </div>

            <QuickView product={selectedProduct} />
        </div>
    );
};

export default CategoryTopProduct;