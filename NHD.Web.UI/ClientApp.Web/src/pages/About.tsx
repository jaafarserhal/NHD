import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HomeContent from '../components/HomeContent/Index';

const AboutPage: React.FC = () => {
    return (
        <>
            <Header />
            <div
                className="breadcrumb breadcrumb-about"
                data-bg-image="assets/images/bg/breadcrumb-bg-3.jpg"
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">About Us</h1>
                                <p className="breadcrumb_text">
                                    Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco
                                    cillum dolor. Voluptate exercitation incididunt.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <HomeContent />
            <Footer />
        </>
    );
};

export default AboutPage;
