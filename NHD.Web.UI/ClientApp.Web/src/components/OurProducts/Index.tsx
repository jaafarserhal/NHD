import React, { useState } from "react";
import { LookupItem, ProductsWithGallery } from "../../api/common/Types";
import Product from "../Product/Index";
import QuickView from "../QuickView/Index";
import homeService from "../../api/homeService";

interface OurProductsProps {
    informativeData: any[];
    categories: LookupItem[];
    products: ProductsWithGallery[];
}

const OurProducts: React.FC<OurProductsProps> = ({
    informativeData,
    categories,
    products: initialProducts,
}) => {
    if (!initialProducts || initialProducts.length === 0 || !categories || categories.length === 0) {
        return null;
    }

    const [selectedProduct, setSelectedProduct] = useState<ProductsWithGallery | null>(null);
    const [activeCategory, setActiveCategory] = useState<number>(0);
    const [products, setProducts] = useState<ProductsWithGallery[]>(initialProducts);
    const [loading, setLoading] = useState<boolean>(false);

    const handleQuickView = (product: ProductsWithGallery) => {
        setSelectedProduct(product);
    };

    const handleCategoryChange = async (categoryId: number) => {
        if (activeCategory === categoryId) return;

        setActiveCategory(categoryId);

        // Prevent flicker by delaying loader
        const loaderTimeout = setTimeout(() => setLoading(true), 150);

        try {
            const response = await homeService.getHomeProductsByCategory(categoryId);
            const fetchedProducts = response;

            setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            clearTimeout(loaderTimeout);
            setLoading(false);
        }
    };

    return (
        <>
            {/* Embedded Styles */}
            <style>{`
                .products-wrapper {
                    position: relative;
                    min-height: 420px;
                }

                .products-loader {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.7);
                    z-index: 10;
                }

                .spinner {
                    width: 44px;
                    height: 44px;
                    border: 5px solid #ddd;
                    border-top-color: #444;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .products-grid.loading {
                    filter: blur(3px);
                    pointer-events: none;
                    user-select: none;
                }
            `}</style>

            <section className="section-padding-01">
                <div className="container">

                    {/* Section Header */}
                    <div className="section-title text-center max-width-720 mx-auto">
                        <h2 className="section-title__title text-uppercase" >{informativeData?.[0]?.titleEn}</h2>
                        <p>
                            {informativeData?.[0]?.descriptionEn}
                        </p>
                    </div>

                    {/* Categories Tabs */}
                    <div className="product-tab-menu pb-8">
                        <ul className="nav justify-content-center">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <button
                                        className={activeCategory === category.id ? "active" : ""}
                                        onClick={() => handleCategoryChange(category.id)}
                                        type="button"
                                    >
                                        {category.nameEn}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Products Grid & Loader */}
                    <div className="products-wrapper">

                        {loading && (
                            <div className="products-loader">
                                <div className="spinner" />
                            </div>
                        )}

                        <div className={`products-grid row row-cols-lg-4 row-cols-sm-2 row-cols-1 mb-n50 ${loading ? "loading" : ""}`}>
                            {products.map((product) => (
                                <Product
                                    key={product.id}
                                    product={product}
                                    onQuickView={handleQuickView}
                                    isByCategory={true}
                                    modalId="ourProductsModal"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <QuickView product={selectedProduct} modalId="ourProductsModal" />
            </section>
        </>
    );
};

export default OurProducts;
