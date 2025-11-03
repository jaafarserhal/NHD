import React, { useEffect, useState } from "react";
import { ProductsWithGallery } from "../../api/common/Types";
import productService from "../../api/productService";
import QuickView from "./QuickView";

const CategoryTopProduct: React.FC = () => {
    const [data, setData] = useState<ProductsWithGallery[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductsWithGallery | null>(null);

    const handleQuickView = (product: ProductsWithGallery) => {
        setSelectedProduct(product);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await productService.getSignatureGiftsProducts();

                if (Array.isArray(response)) {
                    const mapped = response.map((product: ProductsWithGallery) => ({
                        id: product.id,
                        titleEn: product.titleEn,
                        titleSv: product.titleSv,
                        descriptionEn: product.descriptionEn,
                        descriptionSv: product.descriptionSv,
                        fromPrice: product.fromPrice,
                        imageUrl: product.imageUrl,
                        type: product.type,
                        size: product.size,
                        galleries: product.galleries,
                    }));

                    setData(mapped);
                } else {
                    setData([]);
                    console.warn("Carousel response is not an array:", response);
                }
            } catch (error) {
                console.error("Error fetching carousel products:", error);
                setData([]);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="section-padding-01">
            <div className="container">
                <div className="section-title text-center max-width-720 mx-auto">
                    <h2 className="section-title__title">LUXURY GIFTS</h2>
                    <p>
                        Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor.
                    </p>
                </div>

                <div className="row g-6 gx-lg-10">
                    {data.slice(0, 3).map((product) => (
                        <div className="col-lg-4 col-md-6" key={product.id}>
                            <div className="product-item border text-center">
                                <div className="product-item__image">
                                    <a href={`/product/${product.id}`}>
                                        <img
                                            width={350}
                                            height={350}
                                            src={`${(process.env.REACT_APP_BASE_URL || "")}${product.imageUrl ?? "assets/images/placeholder.png"}`}
                                            alt={product.titleEn}
                                        />
                                    </a>
                                    <ul className="product-item__meta meta-middle">
                                        <li className="product-item__meta-action">
                                            <a
                                                className="labtn-icon-quickview"
                                                href="#"
                                                data-bs-tooltip="tooltip"
                                                data-bs-placement="top"
                                                title="Quick View"
                                                data-bs-toggle="modal"
                                                data-bs-target="#exampleProductModal"
                                                onClick={() => handleQuickView(product)}
                                            />
                                        </li>
                                        <li className="product-item__meta-action">
                                            <a className="labtn-icon-cart" href="#" />
                                        </li>
                                    </ul>
                                </div>
                                <div className="product-item__content pb-3">
                                    <h5 className="product-item__title">
                                        <a href={`/product/${product.id}`}>{product.titleEn}</a>
                                    </h5>
                                    <span className="product-item__price fs-2">
                                        ${product.fromPrice?.toFixed(2)}
                                    </span>
                                    <a href={`/product/${product.id}`} className="product-item__arrow">
                                        <img width={40} height={15} src="assets/images/arrow.svg" alt="arrow" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}

                    {data.length === 0 && <p className="text-center">Loading products...</p>}
                </div>
            </div>

            <QuickView product={selectedProduct} />
        </div>
    );
};

export default CategoryTopProduct;
