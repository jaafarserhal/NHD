import React, { useState } from 'react';
import Header from '../components/Common/Header/Index';
import Footer from '../components/Common/Footer/Index';
import GiftCategory from '../components/CategoryTopProduct/Index';
import Slider from '../components/Slider/Index';
import CallToActionSection from '../components/CallToAction/Index';
import Brands from '../components/Brands/Index';
import Collections from '../components/Collections/Index';
import homeService from '../api/homeService';
import sectionService from '../api/sectionService';
import { SectionType } from '../api/common/Enums';
import OurProducts from '../components/OurProducts/Index';
import ImageWithTitleSection from '../components/ImageWithTitleSection/Index';
import Subscribe from '../components/Subscribe/Index';
import Loader from '../components/Common/Loader/Index';


const HomePage: React.FC = () => {
    const [homeData, setHomeData] = React.useState<any>(null);
    const [loading, setLoading] = useState(false);
    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [carouselData,
                    giftProductData,
                    homeGiftIntro,
                    callToActionData,
                    brandsData,
                    top4CollectionsData,
                    homeProductsInformative,
                    homeProductsCategories,
                    homeProductsData,
                    homeCustomGifts,
                    homeFillDatesInformative,
                    homeFillDatesProducts,
                    homeSubscribe] =
                    await Promise.all([
                        sectionService.getSectionsByType(SectionType.HomeCarousel, 3),
                        homeService.getSignatureGiftsProducts(),
                        sectionService.getSectionsByType(SectionType.HomeGifts, 1),
                        sectionService.getSectionsByType(SectionType.HomeCallToAction, 1),
                        homeService.getBrands(),
                        homeService.getTop4Collections(),
                        sectionService.getSectionsByType(SectionType.HomeOurProducts, 1),
                        homeService.getCategories(),
                        homeService.getHomeProductsByCategory(0),
                        sectionService.getSectionsByType(SectionType.HomeCustomeGifts, 1),
                        sectionService.getSectionsByType(SectionType.HomeFillDates, 1),
                        homeService.getFillDatesProducts(),
                        sectionService.getSectionsByType(SectionType.HomeSubscribe, 1)
                    ]);

                // Combine or store both responses as needed
                setHomeData({
                    carousel: carouselData,
                    giftProducts: giftProductData,
                    giftIntro: homeGiftIntro,
                    callToAction: callToActionData,
                    brands: brandsData,
                    top4Collections: top4CollectionsData,
                    homeProductsInformative: homeProductsInformative,
                    homeProductsCategories: homeProductsCategories,
                    homeProducts: homeProductsData,
                    homeCustomGifts: homeCustomGifts,
                    fillDatesInformative: homeFillDatesInformative,
                    fillDatesProducts: homeFillDatesProducts,
                    homeSubscribe: homeSubscribe
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching home page data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    return (
        <>
            <Loader loading={loading} />
            <Header />
            <Slider sliderData={homeData?.carousel} />
            <GiftCategory informativeData={homeData?.giftIntro} products={homeData?.giftProducts} modalId="giftProductModal" />
            <CallToActionSection callToActionData={homeData?.callToAction} />
            <Brands brands={homeData?.brands} />
            <Collections collections={homeData?.top4Collections} />
            <OurProducts informativeData={homeData?.homeProductsInformative} categories={homeData?.homeProductsCategories} products={homeData?.homeProducts} />
            <ImageWithTitleSection informativeData={homeData?.homeCustomGifts} />
            <GiftCategory informativeData={homeData?.fillDatesInformative} products={homeData?.fillDatesProducts} modalId="fillDatesProductModal" />
            <Subscribe informativeData={homeData?.homeSubscribe} />
            <Footer />
        </>
    );
};

export default HomePage;