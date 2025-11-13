import React, { useState } from "react";
import { LookupItem, ProductsWithGallery } from "../../api/common/Types";
import Product from "../Product/Index";
import QuickView from "../CategoryTopProduct/QuickView";

interface OurProductsProps {
    informativeData: any[];
    categories: LookupItem[];
    products: ProductsWithGallery[];
}

const OurProducts: React.FC<OurProductsProps> = ({ informativeData, categories, products }) => {

    if (!products || products.length === 0 || !categories || categories.length === 0) {
        return null; // or a loading indicator / message
    }

    const [selectedProduct, setSelectedProduct] = useState<ProductsWithGallery | null>(null);

    const handleQuickView = (product: ProductsWithGallery) => {
        setSelectedProduct(product);
    };

    return (
        <section className="section-padding-01">
            <div className="container">
                {/* Section Header */}
                <div className="section-title text-center max-width-720 mx-auto">
                    <h2 className="section-title__title">OUR PRODUCTS</h2>
                    <p>
                        Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco
                        cillum dolor. Voluptate exercitation incididunt
                    </p>
                </div>

                {/* Product Tabs */}
                <div className="product-tab-menu pb-8">
                    <ul className="nav justify-content-center">
                        {categories.map((category, idx) => (
                            <li key={category.id}>
                                <button
                                    className={idx === 0 ? "active" : ""}
                                    data-bs-toggle="tab"
                                    data-bs-target={`#tab${idx + 1}`}
                                >
                                    {category.nameEn}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Product Grid */}
                <div className="tab-content">
                    <div className="tab-pane fade show active" id="tab1">
                        <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 mb-n50">
                            {products.map((product) => (
                                <Product key={product.id} product={product} onQuickView={handleQuickView} isByCategory={true} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <QuickView product={selectedProduct} />
        </section>
    );
};

export default OurProducts;