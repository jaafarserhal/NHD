import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="footer-section">
            {/* Footer Widget Section Start */}
            <div className="footer-widget-section">
                <div className="container custom-container">
                    <div className="row gy-6">
                        <div className="col-md-4">
                            {/* Footer Widget Start */}
                            <div className="footer-widget">
                                <div className="footer-widget__logo">
                                    <a className="logo-dark" href="index.html">
                                        <img src="assets/images/logo.svg" alt="Logo" />
                                    </a>
                                    <a className="logo-white d-none" href="index.html">
                                        <img src="assets/images/logo-white.svg" alt="Logo" />
                                    </a>
                                </div>
                                <div className="footer-widget__social">
                                    <a href="#/"><i className="lastudioicon-b-facebook"></i></a>
                                    <a href="#/"><i className="lastudioicon-b-twitter"></i></a>
                                    <a href="#/"><i className="lastudioicon-b-pinterest"></i></a>
                                    <a href="#/"><i className="lastudioicon-b-instagram"></i></a>
                                </div>
                            </div>
                            {/* Footer Widget End */}
                        </div>

                        <div className="col-md-8">
                            {/* Footer Widget Wrapper Start */}
                            <div className="footer-widget-wrapper d-flex flex-wrap gap-4">

                                {/* Footer Widget Start */}
                                <div className="footer-widget flex-grow-1">
                                    <h4 className="footer-widget__title">Categories</h4>
                                    <ul className="footer-widget__link">
                                        <li><a href="shop.html">Cupcake</a></li>
                                        <li><a href="shop.html">Pastry</a></li>
                                        <li><a href="shop.html">Muffin</a></li>
                                        <li><a href="shop.html">Waffle</a></li>
                                    </ul>
                                </div>
                                {/* Footer Widget End */}

                                {/* Footer Widget Start */}
                                <div className="footer-widget flex-grow-1">
                                    <h4 className="footer-widget__title">Services</h4>
                                    <ul className="footer-widget__link">
                                        <li><a href="contact.html">Delivery</a></li>
                                        <li><a href="contact.html">Payment</a></li>
                                        <li><a href="contact.html">Returns</a></li>
                                        <li><a href="contact.html">Privacy</a></li>
                                    </ul>
                                </div>
                                {/* Footer Widget End */}

                                {/* Footer Widget Start */}
                                <div className="footer-widget flex-grow-1">
                                    <h4 className="footer-widget__title">Information</h4>
                                    <ul className="footer-widget__link">
                                        <li><a href="about.html">About Us</a></li>
                                        <li><a href="contact.html">Contact Us</a></li>
                                        <li><a href="blog-details.html">Latest Post</a></li>
                                        <li><a href="about.html">Selling Tips</a></li>
                                    </ul>
                                </div>
                                {/* Footer Widget End */}

                            </div>
                            {/* Footer Widget Wrapper End */}
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer Widget Section End */}

            {/* Footer Copyright Start */}
            <div className="footer-copyright footer-copyright-two">
                <div className="container">
                    <div className="footer-copyright-text text-center">
                        <p>
                            &copy; 2022 <strong>Bakerfresh</strong> Made with{" "}
                            <i className="lastudioicon-heart-1"></i> by{" "}
                            <a href="https://themeforest.net/user/bootxperts/portfolio">
                                BootXperts
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            {/* Footer Copyright End */}
        </footer>
    );
};

export default Footer;
