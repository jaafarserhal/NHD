import React from "react";
import { ProductsWithGallery } from "../../api/common/Types";


interface QuickViewProps {
    product: ProductsWithGallery | null;
}

const QuickView: React.FC<QuickViewProps> = ({ product }) => {
    console.log("QuickView product:", product);
    return (
        <div className="quickview-product-modal modal fade" id="exampleProductModal">
            <div className="modal-dialog modal-dialog-centered mw-100">
                <div className="container">
                    <div className="modal-content">
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="lastudioicon lastudioicon-e-remove"></i>
                        </button>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-6 offset-lg-0 col-md-10 offset-md-1">
                                    <div className="product-details-img d-flex overflow-hidden flex-row">
                                        <div className="single-product-vertical-tab swiper-container order-2">
                                            <div className="swiper-wrapper">
                                                {product?.galleries?.map((galleryItem) => (
                                                    <a className="swiper-slide h-auto" href="#/" key={galleryItem.id}>
                                                        <img
                                                            className="w-100"
                                                            src={galleryItem.imageUrl}
                                                            alt={galleryItem.altText}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                            <div className="swiper-button-vertical-next swiper-button-next">
                                                <i className="lastudioicon-arrow-right"></i>
                                            </div>
                                            <div className="swiper-button-vertical-prev swiper-button-prev">
                                                <i className="lastudioicon-arrow-left"></i>
                                            </div>
                                        </div>
                                        <div className="product-thumb-vertical overflow-hidden swiper-container order-1">
                                            <div className="swiper-wrapper">
                                                {product?.galleries?.map((galleryItem) => (
                                                    <div className="swiper-slide" key={galleryItem.id}>
                                                        <img
                                                            src={galleryItem.imageUrl}
                                                            alt={galleryItem.altText}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="product-summery position-relative">
                                        <div className="product-head mb-3">
                                            <span className="product-head-price">${product?.fromPrice.toFixed(2)}</span>
                                        </div>
                                        <p className="desc-content">
                                            {product?.descriptionEn}
                                        </p>
                                        <ul className="product-cta">
                                            <li>
                                                <div className="quantity">
                                                    <div className="cart-plus-minus"></div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="cart-btn">
                                                    <div className="add-to_cart">
                                                        <a className="btn btn-dark btn-hover-primary" href="cart.html">
                                                            Add to cart
                                                        </a>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                        <ul className="product-meta">
                                            <li className="product-meta-wrapper">
                                                <span className="product-meta-name">Type:</span>
                                                <span className="product-meta-detail">{product?.type}</span>
                                            </li>
                                            <li className="product-meta-wrapper">
                                                <span className="product-meta-name">Size:</span>
                                                <span className="product-meta-detail">{product?.size}</span>
                                            </li>
                                        </ul>
                                        <div className="product-share">
                                            <a href="#">
                                                <i className="lastudioicon-b-facebook"></i>
                                            </a>
                                            <a href="#">
                                                <i className="lastudioicon-b-twitter"></i>
                                            </a>
                                            <a href="#">
                                                <i className="lastudioicon-b-pinterest"></i>
                                            </a>
                                            <a href="#">
                                                <i className="lastudioicon-b-instagram"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickView;
