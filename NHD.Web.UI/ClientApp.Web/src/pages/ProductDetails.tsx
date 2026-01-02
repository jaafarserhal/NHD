import React, { useEffect, useState } from "react";
import Footer from "../components/Common/Footer/Index";
import Header from "../components/Common/Header/Index";
import { ProductsWithGallery } from "../api/common/Types";
import { useParams } from "react-router-dom";
import productService from "../api/productService";
import Loader from "../components/Common/Loader/Index";

const ProductDetails: React.FC = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [productDetails, setProductDetails] = useState<ProductsWithGallery | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { productId } = useParams<{ productId: string }>();
    const [loading, setLoading] = useState(false);
    // Preload image
    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

    const fetchProductDetails = async () => {
        try {
            setError(null);
            setLoading(true);

            // validate params
            if (!productId) {
                setError("Missing product identifier.");
                return;
            }

            // ensure numeric productId
            if (isNaN(Number(productId))) {
                setError("Invalid product identifier.");
                return;
            }

            const response = await productService.getProductById(Number(productId));
            console.log(response);
            setProductDetails(response.data);

            if (!response.data) {
                setError("No product details found for this product.");
            }
            setLoading(false);
        } catch (err) {
            setError("Failed to load product details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Add this helper function
    const getOrderedGallery = () => {
        if (!productDetails?.galleries || productDetails.galleries.length === 0) {
            return [];
        }

        const primaryIndex = productDetails.galleries.findIndex(img => img.isPrimary);

        if (primaryIndex === -1) {
            return productDetails.galleries;
        }

        // Move primary image to the front
        const ordered = [...productDetails.galleries];
        const [primaryImage] = ordered.splice(primaryIndex, 1);
        ordered.unshift(primaryImage);

        return ordered;
    };

    const orderedGallery = getOrderedGallery();

    const handleNext = () => {
        if (orderedGallery.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % orderedGallery.length);
        }
    };

    const handlePrev = () => {
        if (orderedGallery.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + orderedGallery.length) % orderedGallery.length);
        }
    };

    return (
        <>
            <Loader loading={loading} />
            <Header />
            {/* Breadcrumb Section Start */}
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: "url(/assets/images/banner/contact-us-banner.webp)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: imageLoaded ? 1 : 0.9,
                    transition: "opacity 0.3s ease-in-out"
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">{productDetails?.titleEn}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}

            {/* Single Product Section Start */}
            <div className="section section-margin-top section-padding-03">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-0 col-md-10 offset-md-1">
                            {/* Product Details Image Start */}
                            <div className="product-details-img d-flex overflow-hidden flex-row">
                                {/* Main Image Display */}
                                <div className="single-product-vertical-tab swiper-container order-2">
                                    <div className="swiper-wrapper popup-gallery" id="popup-gallery">
                                        {orderedGallery.length > 0 ? (
                                            <div className="swiper-slide h-auto">
                                                <img
                                                    className="w-100"
                                                    src={`${(process.env.REACT_APP_BASE_URL || "")}${orderedGallery[currentImageIndex]?.imageUrl ?? "/assets/images/placeholder.png"}`}
                                                    alt={orderedGallery[currentImageIndex]?.altText || "Product"}
                                                />
                                            </div>
                                        ) : (
                                            <div className="swiper-slide h-auto">
                                                <img className="w-100" src="/assets/images/product/no-image.png" alt="No image" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="swiper-button-vertical-next swiper-button-next" onClick={handleNext}>
                                        <i className="lastudioicon-arrow-right" />
                                    </div>
                                    <div className="swiper-button-vertical-prev swiper-button-prev" onClick={handlePrev}>
                                        <i className="lastudioicon-arrow-left" />
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                <div className="product-thumb-vertical overflow-hidden swiper-container order-1">
                                    <div className="swiper-wrapper" style={{ flexDirection: 'column' }}>
                                        {orderedGallery.map((image, index) => (
                                            <div
                                                className={`${currentImageIndex === index ? 'swiper-slide-active' : 'swiper-slide '}`}
                                                key={image.id}
                                                onClick={() => setCurrentImageIndex(index)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img
                                                    src={`${(process.env.REACT_APP_BASE_URL || "")}${image.imageUrl ?? "/assets/images/placeholder.png"}`}
                                                    alt={image.altText || `Thumbnail ${index + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Product Details Image End */}
                        </div>

                        <div className="col-lg-6">
                            {/* Product Summery Start */}
                            <div className="product-summery position-relative">
                                {/* Product Head Start */}
                                <div className="product-head mb-3">
                                    <span className="product-head-price">${productDetails?.fromPrice}</span>
                                </div>

                                <ul className="product-cta">
                                    <li>
                                        <div className="cart-btn">
                                            <div className="add-to_cart">
                                                <a
                                                    className="btn btn-dark btn-hover-primary"
                                                    href="#/"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#modalCart"
                                                >
                                                    Add to cart
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                </ul>

                                {/* <ul className="product-meta">
                                    <li className="product-meta-wrapper">
                                        <span className="product-meta-name">SKU:</span>
                                        <span className="product-meta-detail">REF. LA-199</span>
                                    </li>
                                    <li className="product-meta-wrapper">
                                        <span className="product-meta-name">category:</span>
                                        <span className="product-meta-detail">
                                            <a href="#">Cake, </a>
                                            <a href="#">New</a>
                                        </span>
                                    </li>
                                    <li className="product-meta-wrapper">
                                        <span className="product-meta-name">Tags:</span>
                                        <span className="product-meta-detail">
                                            <a href="#">Cake 1</a>
                                        </span>
                                    </li>
                                </ul> */}

                                <div className="product-share">
                                    <a href="#">
                                        <i className="lastudioicon-b-facebook" />
                                    </a>
                                    <a href="#">
                                        <i className="lastudioicon-b-twitter" />
                                    </a>
                                    <a href="#">
                                        <i className="lastudioicon-b-pinterest" />
                                    </a>
                                    <a href="#">
                                        <i className="lastudioicon-b-instagram" />
                                    </a>
                                </div>
                            </div>
                            {/* Product Summery End */}
                        </div>
                    </div>
                    <div className="row section-margin">
                        <div className="col-lg-12 single-product-tab" style={{ margin: '0x' }}>
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item">
                                    <a
                                        className="nav-link active"
                                        id="home-tab"
                                        data-bs-toggle="tab"
                                        href="#connect-1"
                                        role="tab"
                                        aria-selected="true"
                                    >
                                        Description
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        id="review-tab"
                                        data-bs-toggle="tab"
                                        href="#connect-4"
                                        role="tab"
                                        aria-selected="false"
                                    >
                                        Additional information
                                    </a>
                                </li>
                            </ul>

                            <div className="tab-content mb-text" id="myTabContent">
                                {/* Description tab */}
                                <div
                                    className="tab-pane fade show active"
                                    id="connect-1"
                                    role="tabpanel"
                                    aria-labelledby="home-tab"
                                >
                                    <div className="product-desc-row">
                                        <div className="product-desc-img">
                                            <img src={`${(process.env.REACT_APP_BASE_URL || "")}${productDetails?.imageUrl ?? "/assets/images/placeholder.png"}`} alt="Image" />
                                        </div>
                                        <div className="product-desc-content">
                                            <p className="product-desc-text">
                                                {productDetails?.descriptionEn}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional information tab */}
                                <div
                                    className="tab-pane fade"
                                    id="connect-4"
                                    role="tabpanel"
                                    aria-labelledby="review-tab"
                                >
                                    <div className="size-tab table-responsive-lg">
                                        <table className="table border mb-0">
                                            <tbody>
                                                {productDetails?.type && (
                                                    <tr>
                                                        <td className="cun-name">
                                                            <span>Type</span>
                                                        </td>
                                                        <td>{productDetails?.type}</td>
                                                    </tr>
                                                )}
                                                {productDetails?.size && (
                                                    <tr>
                                                        <td className="cun-name">
                                                            <span>Size</span>
                                                        </td>
                                                        <td>{productDetails?.size}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
            <Footer isDark={true} />
        </>
    );
};

export default ProductDetails;
