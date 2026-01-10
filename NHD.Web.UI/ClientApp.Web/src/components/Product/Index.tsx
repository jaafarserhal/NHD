import React from "react";
import { ProductsWithGallery } from "../../api/common/Types";

interface ProductProps {
    product: ProductsWithGallery;
    onQuickView?: (product: ProductsWithGallery) => void;
    isByCategory?: boolean;
    modalId?: string;
    urlPrefix?: string;
}
//product-item border text-center
const Product: React.FC<ProductProps> = ({ product, onQuickView, isByCategory, modalId, urlPrefix = '/product' }) => {
    return (
        <div className={isByCategory ? 'col mb-50' : 'col-lg-4 col-md-6'}>
            <div className={`product-item ${isByCategory ? '' : 'border'} text-center`}>
                {product.badgeTextEn && <div className="product-item__badge">{product.badgeTextEn}</div>}
                <div className={`product-item__image ${isByCategory ? 'border w-100' : ''}`} >
                    <a href={`${urlPrefix}/${product.id}/${product.titleEn.replace(/\s+/g, '-').toLowerCase()}`}>
                        <img
                            width={500}
                            height={625}
                            src={`${(process.env.REACT_APP_BASE_URL || "")}${product.imageUrl ?? "/assets/images/placeholder.png"}`}
                            alt={product.titleEn}
                        />
                    </a>
                    {modalId && <ul className={`product-item__meta ${isByCategory ? '' : 'meta-middle'}`}>
                        <li className="product-item__meta-action">
                            <a
                                className="labtn-icon-quickview"
                                href="#"
                                data-bs-tooltip="tooltip"
                                data-bs-placement="top"
                                title="Quick View"
                                data-bs-toggle="modal"
                                data-bs-target={`#${modalId}`}
                                onClick={(e) => {
                                    e.preventDefault();

                                    onQuickView && onQuickView(product);
                                }}
                            />
                        </li>
                        <li className="product-item__meta-action">
                            <a className="labtn-icon-cart" href="#" />
                        </li>
                    </ul>}
                </div>

                <div className={`product-item__content ${isByCategory ? 'pt-5' : 'pb-3'}`}>
                    <h5 className="product-item__title">
                        <a href={`${urlPrefix}/${product.id}/${product.titleEn.replace(/\s+/g, '-').toLowerCase()}`}>{product.titleEn}</a>
                    </h5>
                    {(product.fromPrice || product.fromPrice !== 0) && <span className={`product-item__price ${isByCategory ? '' : 'fs-2'}`}>
                        ${product.fromPrice?.toFixed(2)}
                    </span>}
                </div>
            </div>
        </div>
    );
};

export default Product;