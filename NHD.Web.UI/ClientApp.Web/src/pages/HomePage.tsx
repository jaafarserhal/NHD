import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import GiftCategory from '../components/CategoryTopProduct/Index';
import HomeContent from '../components/HomeContent/Index';
import Slider from '../components/Slider/Index';
import CallToActionSection from '../components/CallToActionSection/Index';
import Brands from '../components/Brands/Index';
import Collections from '../components/Collections/Index';
import homeService from '../api/homeService';
import { SectionType } from '../api/common/Enums';


const HomePage: React.FC = () => {
    const [homeData, setHomeData] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [callToActionData, carouselData, giftData] = await Promise.all([
                    homeService.getSectionsByType(SectionType.HomeCallToAction, 1),
                    homeService.getSectionsByType(SectionType.HomeCarousel, 3),
                    homeService.getSectionsByType(SectionType.HomeGifts, 1)

                ]);

                // Combine or store both responses as needed
                setHomeData({
                    callToAction: callToActionData,
                    carousel: carouselData,
                    gifts: giftData
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
            <GiftCategory informativeData={homeData?.gifts} />
            <CallToActionSection callToActionData={homeData?.callToAction} />
            <Brands />
            <Collections />
            <HomeContent />
            <Footer />
        </>
    );
};

export default HomePage;