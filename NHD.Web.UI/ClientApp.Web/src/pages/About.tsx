import React, { useState, useEffect } from "react";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";
import sectionService from "../api/sectionService";
import homeService from "../api/homeService";
import { SectionType } from "../api/common/Enums";
import Loader from "../components/Common/Loader/Index";
import Brands from "../components/Brands/Index";
import ImageWithTitleSection from "../components/ImageWithTitleSection/Index";
import VideoPlayer from "../components/VideoPlayer/Index";

export default function About() {
    const [aboutData, setAboutData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [bannerImageLoaded, setBannerImageLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [mainSectionData,
                    weLoveDatesData,
                    nawaExperienceData,
                    brandsData] =
                    await Promise.all([
                        sectionService.getSectionsByType(SectionType.AboutMainSection, 1),
                        sectionService.getSectionsByType(SectionType.AboutWeLoveDates, 1),
                        sectionService.getSectionsByType(SectionType.AboutNawaExperience, 1),
                        homeService.getBrands()
                    ]);

                // Combine or store both responses as needed
                setAboutData({
                    mainSection: mainSectionData,
                    weLoveDates: weLoveDatesData,
                    nawaExperience: nawaExperienceData,
                    brands: brandsData
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching home page data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Preload banner image when data is available
    useEffect(() => {
        if (aboutData?.mainSection?.[0]?.imageUrl) {
            const img = new Image();
            img.src = `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${aboutData.mainSection[0].imageUrl}`;
            img.onload = () => setBannerImageLoaded(true);
        }
    }, [aboutData?.mainSection]);

    const bannerImageUrl = aboutData?.mainSection?.[0]?.imageUrl
        ? `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${aboutData.mainSection[0].imageUrl}`
        : '';

    const weLoveDatesImageUrl = aboutData?.weLoveDates?.[0]?.imageUrl
        ? `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${aboutData.weLoveDates[0].imageUrl}`
        : '';

    return (
        <>
            <Loader loading={loading} />
            <Header />

            {/* Breadcrumb Section */}
            <div
                className="breadcrumb breadcrumb-about"
                style={{
                    backgroundImage: bannerImageUrl ? `url(${bannerImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    opacity: bannerImageLoaded ? 1 : 0.9,
                    transition: 'opacity 0.3s ease-in-out'
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">About Us</h1>
                                <p className="breadcrumb_text">
                                    {aboutData?.mainSection?.[0]?.descriptionEn || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* We love Dates Section */}
            {aboutData?.weLoveDates && (
                <div className="section-padding-03 overflow-hidden">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="section-title-10 justify-content-start text-start align-items-start">
                                    <h1 className="section-title-10__title">
                                        {aboutData.weLoveDates[0]?.titleEn || ''}
                                    </h1>
                                    <p className="section-title-10__text">
                                        {aboutData.weLoveDates[0]?.descriptionEn || ''}
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="aboutus-image">
                                    <img
                                        src={weLoveDatesImageUrl}
                                        alt={aboutData.weLoveDates[0]?.titleEn || 'About section'}
                                        loading="lazy"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Section */}
            <VideoPlayer
                videoUrl={`/assets/media/about-us-video.mp4`}
                screenshotTime={0.5}
                height={720}
            />

            {/* Brand Logos */}
            <Brands brands={aboutData?.brands} />

            {/* Nawa Experience Section */}
            <ImageWithTitleSection informativeData={aboutData?.nawaExperience} />

            <Footer />
        </>
    );
}