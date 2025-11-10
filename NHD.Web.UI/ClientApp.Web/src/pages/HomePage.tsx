import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import GiftCategory from '../components/CategoryTopProduct/Index';
import HomeContent from '../components/HomeContent/Index';
import Slider from '../components/Slider/Index';
import CallToActionSection from '../components/CallToActionSection/Index';


const HomePage: React.FC = () => {
    return (
        <>
            <Header />
            <Slider />
            <GiftCategory />
            <CallToActionSection />
            <HomeContent />
            <Footer />
        </>
    );
};

export default HomePage;