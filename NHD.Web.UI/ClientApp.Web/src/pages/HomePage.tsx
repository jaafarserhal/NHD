import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import GiftCategory from '../components/CategoryTopProduct/Index';
import Slider from '../components/Slider/Index';
import CallToActionSection from '../components/CallToAction/Index';
import Brands from '../components/Brands/Index';
import Collections from '../components/Collections/Index';
import homeService from '../api/homeService';
import { SectionType } from '../api/common/Enums';
import OurProducts from '../components/OurProducts/Index';
import CustomGifts from '../components/CustomGifts/Index';
import Subscribe from '../components/Subscribe/Index';


const HomePage: React.FC = () => {
    const [homeData, setHomeData] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchData = async () => {
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
                        homeService.getSectionsByType(SectionType.HomeCarousel, 3),
                        homeService.getSignatureGiftsProducts(),
                        homeService.getSectionsByType(SectionType.HomeGifts, 1),
                        homeService.getSectionsByType(SectionType.HomeCallToAction, 1),
                        homeService.getBrands(),
                        homeService.getTop4Collections(),
                        homeService.getSectionsByType(SectionType.HomeOurProducts, 1),
                        homeService.getCategories(),
                        homeService.getHomeProductsByCategory(0),
                        homeService.getSectionsByType(SectionType.HomeCustomeGifts, 1),
                        homeService.getSectionsByType(SectionType.HomeFillDates, 1),
                        homeService.getFillDatesProducts(),
                        homeService.getSectionsByType(SectionType.HomeSubscribe, 1)
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
            } catch (error) {
                console.error("Error fetching home page data:", error);
            }
        };

        fetchData();
    }, []);


    return (
        <>
            <Header />
            <Slider sliderData={homeData?.carousel} />
            <GiftCategory informativeData={homeData?.giftIntro} products={homeData?.giftProducts} modalId="giftProductModal" />
            <CallToActionSection callToActionData={homeData?.callToAction} />
            <Brands brands={homeData?.brands} />
            <Collections collections={homeData?.top4Collections} />
            <OurProducts informativeData={homeData?.homeProductsInformative} categories={homeData?.homeProductsCategories} products={homeData?.homeProducts} />
            <CustomGifts informativeData={homeData?.homeCustomGifts} />
            <GiftCategory informativeData={homeData?.fillDatesInformative} products={homeData?.fillDatesProducts} modalId="fillDatesProductModal" />
            <Subscribe informativeData={homeData?.homeSubscribe} />
            <Footer />
        </>
    );
};

export default HomePage;