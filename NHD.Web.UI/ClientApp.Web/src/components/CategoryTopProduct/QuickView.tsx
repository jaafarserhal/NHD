import React, { useEffect, useRef } from "react";
import Swiper from "swiper";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import { ProductsWithGallery } from "../../api/common/Types";

interface QuickViewProps {
    product: ProductsWithGallery | null;
}

const QuickView: React.FC<QuickViewProps> = ({ product }) => {
    const thumbSwiperRef = useRef<Swiper | null>(null);
    const mainSwiperRef = useRef<Swiper | null>(null);

    // DOM element refs
    const thumbContainerRef = useRef<HTMLDivElement>(null);
    const mainContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!product?.galleries || product.galleries.length < 2) return;

        const modalElement = document.getElementById("exampleProductModal");

        const initializeSwiper = () => {
            // Check if refs are available
            if (!thumbContainerRef.current || !mainContainerRef.current) {
                console.warn("Swiper containers not ready");
                return;
            }

            // Destroy previous instances if they exist
            thumbSwiperRef.current?.destroy(true, true);
            mainSwiperRef.current?.destroy(true, true);

            // Initialize thumbnails swiper using ref
            thumbSwiperRef.current = new Swiper(thumbContainerRef.current, {
                modules: [FreeMode],
                direction: "vertical",
                slidesPerView: 4,
                spaceBetween: 10,
                freeMode: true,
                watchSlidesProgress: true,
                slideToClickedSlide: true,
            });

            // Initialize main swiper using ref
            mainSwiperRef.current = new Swiper(mainContainerRef.current, {
                modules: [Navigation, Thumbs],
                spaceBetween: 10,
                navigation: {
                    nextEl: ".swiper-button-vertical-next",
                    prevEl: ".swiper-button-vertical-prev",
                },
                thumbs: {
                    swiper: thumbSwiperRef.current,
                },
                observer: true,
                observeParents: true,
            });
        };

        if (modalElement) {
            const handleModalShown = () => {
                setTimeout(initializeSwiper, 100);
            };

            modalElement.addEventListener("shown.bs.modal", handleModalShown);

            // Check if modal is already open
            if (modalElement.classList.contains("show")) {
                setTimeout(initializeSwiper, 100);
            }

            // Cleanup
            return () => {
                modalElement.removeEventListener("shown.bs.modal", handleModalShown);
                thumbSwiperRef.current?.destroy(true, true);
                mainSwiperRef.current?.destroy(true, true);
            };
        }

        return () => {
            thumbSwiperRef.current?.destroy(true, true);
            mainSwiperRef.current?.destroy(true, true);
        };
    }, [product]);

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
                                        {/* Main Swiper */}
                                        <div
                                            ref={mainContainerRef}
                                            className="swiper single-product-vertical-tab order-2"
                                        >
                                            <div className="swiper-wrapper">
                                                {product?.galleries?.map((galleryItem) => (
                                                    <div className="swiper-slide" key={galleryItem.id}>
                                                        <img
                                                            className="w-100"
                                                            src={`${process.env.REACT_APP_BASE_URL || ""}${galleryItem.imageUrl}`}
                                                            alt={galleryItem.altText}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Thumbnails Swiper */}
                                        <div
                                            ref={thumbContainerRef}
                                            className="swiper product-thumb-vertical overflow-hidden order-1"
                                        >
                                            <div className="swiper-wrapper">
                                                {product?.galleries?.map((galleryItem) => (
                                                    <div
                                                        className="swiper-slide"
                                                        key={galleryItem.id}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <img
                                                            src={`${process.env.REACT_APP_BASE_URL || ""}${galleryItem.imageUrl}`}
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
                                            <span className="product-head-price">
                                                ${product?.fromPrice.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="desc-content">{product?.descriptionEn}</p>
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