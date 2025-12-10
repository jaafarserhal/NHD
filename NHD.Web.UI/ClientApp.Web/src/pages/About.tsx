import React from "react";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";

export default function About() {
    return (
        <>
            <Header />
            {/* Breadcrumb Section */}
            <div className="breadcrumb breadcrumb-about" data-bg-image="assets/images/bg/breadcrumb-bg-3.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">About Us</h1>
                                <p className="breadcrumb_text">
                                    Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor.
                                    Voluptate exercitation incididunt
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="section-padding-03 overflow-hidden">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="section-title-10 justify-content-start text-start align-items-start">
                                <span className="section-title-10__subtitle">We Are Bakerfresh</span>
                                <h1 className="section-title-10__title">we love cake</h1>
                                <p className="section-title-10__text">
                                    Nullam dictum, justo eu blandit lacinia, diam libero porta sem, sit amet
                                    molestie tellus lacus non orci.
                                </p>
                                <p className="section-title-10__text">
                                    Vestibulum eu tristique tellus. Praesent at varius nisi, ut dignissim lectus.
                                </p>
                                <img src="assets/images/singnecher-2.png" alt="Signature" />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="aboutus-image">
                                <img src="assets/images/about/about.jpg" alt="About" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="call-to-action callto-action-04" data-bg-image="assets/images/bg/call-to-action-bg-2.jpg">
                <div className="container">
                    <div className="row align-items-center gy-8 gx-0">
                        <div className="col-12">
                            <div className="call-to-action-more text-center position-relative popup-video" id="popup-video">
                                <a className="call-to-action-more__arrow text-white lh-1 video-popup" href="https://www.youtube.com/watch?v=v9nBysHSzhE">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="none" viewBox="0 0 20 24">
                                        <path fill="currentColor" d="M.417.5v23L19.583 12 .417.5z"></path>
                                    </svg>
                                </a>
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <img className="call-to-action-more__svg" src="assets/images/svg-text.svg" alt="SVG Text" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Schedule */}
            <div className="section-padding-03 overflow-hidden">
                <div className="container">
                    <div className="row flex-md-row-reverse align-items-center">
                        <div className="col-md-5">
                            <div className="section-title-10 justify-content-start text-start align-items-start">
                                <span className="section-title-10__subtitle">Bakerfresh Time</span>
                                <h1 className="section-title-10__title">we are open</h1>
                                <p className="section-title-10__text">
                                    Aliqua id fugiat nostrud irure ex duis ea quis id quis ad et. Sunt qui esse pariatur
                                </p>
                            </div>
                            <ul className="about-schedule">
                                <li>
                                    <span className="about-schedule_name">Mon - Fri</span>
                                    <span className="about-schedule_time">9:00 am - 9:00 pm</span>
                                </li>
                                <li>
                                    <span className="about-schedule_name">Sat - Sun</span>
                                    <span className="about-schedule_time">10:00 am - 10:00 pm</span>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-7">
                            <div className="aboutus-image-two">
                                <img src="assets/images/about/about-2.jpg" alt="About" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="team-2 section-padding-03 pt-0">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h2 className="section-title-10__title mb-5">Our Chef</h2>
                        </div>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 mb-n25">
                        {[1, 2, 3].map((i) => (
                            <div className="col mb-25" key={i}>
                                <div className="team-2-wrapper">
                                    <div className="team-2-thumb">
                                        <img src={`assets/images/team/team-${i}.jpg`} alt="Team" />
                                    </div>
                                    <div className="team-2-content">
                                        <span className="team-2-name">Chef Name</span>
                                        <span className="team-2-designation">Chef Cook</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="testimonial-section section-padding-03" data-bg-color="#F9F9F9">
                <div className="container text-center">
                    <h2 className="section-title-10__title mb-5">Customers Review</h2>
                </div>
            </div>

            {/* Brand Logos */}
            <div className="brand-section">
                <div className="container">
                    <div className="brand-active">
                        <div className="swiper-wrapper align-items-center">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div className="swiper-slide brand-item" key={i}>
                                    <img src={`assets/images/brand/partner-${i}.png`} alt="Brand" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer isDark={true} />
        </>
    );
};