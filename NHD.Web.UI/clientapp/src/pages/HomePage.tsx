import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Products from '../components/HomeTopThreeProducts/Index';
import HomeContent from '../components/HomeContent/Index';
import Slider from '../components/Slider/Index';


const HomePage: React.FC = () => {
    return (
        <>
            <Header />
            <Slider />
            <Products />
            <HomeContent />
            <Footer />
        </>
    );
};

export default HomePage;