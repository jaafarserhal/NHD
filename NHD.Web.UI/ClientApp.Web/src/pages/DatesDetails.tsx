import React, { useEffect, useState } from "react";
import Footer from "../components/Common/Footer/Index";
import Header from "../components/Common/Header/Index";
import { DatesWithGallery } from "../api/common/Types";
import { Link, useParams } from "react-router-dom";
import dateService from "../api/dateService";
import Loader from "../components/Common/Loader/Index";
import sectionService from '../api/sectionService';
import { SectionType } from "../api/common/Enums";
import { routeUrls } from "../api/base/routeUrls";

const DatesDetails: React.FC = () => {
    const [datesDetails, setDatesDetails] = useState<DatesWithGallery | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { datesId } = useParams<{ datesId: string }>();
    const [loading, setLoading] = useState(false);
    const [mainSection, setMainSection] = useState<any>(null);
    const [bannerImageLoaded, setBannerImageLoaded] = useState(false);

    const fetchDatesDetails = async () => {
        try {
            setError(null);
            setLoading(true);

            // validate params
            if (!datesId) {
                setError("Missing dates identifier.");
                return;
            }

            // ensure numeric datesId
            if (isNaN(Number(datesId))) {
                setError("Invalid product identifier.");
                return;
            }
            const [mainSectionRes, dateRes] = await Promise.all([
                sectionService.getSectionsByType(SectionType.OurDatesMainSection, 1),
                dateService.getDatesDetails(Number(datesId))
            ]);

            setMainSection(mainSectionRes as any);
            setDatesDetails(dateRes.data);
            if (!dateRes.data) {
                setError("No date details found for this date.");
            }
            setLoading(false);
        } catch (err) {
            setError("Failed to load date details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatesDetails();
    }, [datesId]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Add this helper function
    const getOrderedGallery = () => {
        if (!datesDetails?.galleries || datesDetails.galleries.length === 0) {
            return [];
        }

        const primaryIndex = datesDetails.galleries.findIndex(img => img.isPrimary);
        if (primaryIndex === -1) {
            return datesDetails.galleries;
        }

        // Move primary image to the front
        const ordered = [...datesDetails.galleries];
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
    // Preload image
    useEffect(() => {
        let isMounted = true;
        const imageUrl = mainSection?.[0]?.imageUrl;

        if (!imageUrl) {
            setBannerImageLoaded(false);
            return;
        }

        const img = new Image();
        img.src = `${process.env.REACT_APP_BASE_URL || ""}/uploads/sections/${imageUrl}`;

        img.onload = () => {
            if (isMounted) setBannerImageLoaded(true);
        };

        return () => {
            isMounted = false;
        };
    }, [mainSection]);

    return (
        <>
            <Loader loading={loading} />
            <Header />
            {/* Breadcrumb Section Start */}
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: mainSection?.[0]?.imageUrl
                        ? `url(${process.env.REACT_APP_BASE_URL || ""}/uploads/sections/${mainSection?.[0]?.imageUrl})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: bannerImageLoaded ? 1 : 0.9,
                    transition: "opacity 0.3s ease-in-out"
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">{mainSection?.[0]?.titleEn ?? ""}</h1>
                                <ul className="breadcrumb_list">
                                    <li>
                                        <Link to={routeUrls.ourDates}>Our Dates</Link>
                                    </li>
                                    <li>Dates Details</li>
                                </ul>
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
                                <div className="product-head flex-column align-items-start mb-3 mb-md-5">
                                    <h2 className="product-title mb-2">{datesDetails?.titleEn}</h2>
                                </div>

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
                            <ul className="nav nav-tabs" id="myTab" role="tablist" style={{ margin: '30px' }}>
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
                                            <img src={`${(process.env.REACT_APP_BASE_URL || "")}${datesDetails?.imageUrl ?? "/assets/images/placeholder.png"}`} alt="Image" />
                                        </div>
                                        <div className="product-desc-content">
                                            <p className="product-desc-text">
                                                {datesDetails?.descriptionEn}
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

                                                {datesDetails?.additionalInfos.map((info) => (
                                                    <tr key={info.id}>
                                                        <th className="cun-name">{info.keyEn}</th>
                                                        <td>{info.valueEn}</td>
                                                    </tr>
                                                ))}
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

export default DatesDetails;
