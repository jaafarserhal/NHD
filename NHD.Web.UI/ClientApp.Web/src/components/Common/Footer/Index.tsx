import React, { useState, useEffect } from "react";
import { LookupItem } from "../../../api/common/Types";
import homeService from "../../../api/homeService";
import faqService from "../../../api/faqService";
import { routeUrls } from "../../../api/base/routeUrls";
import { Link, generatePath } from "react-router-dom";


interface FooterProps {
    isDark?: boolean; // Optional prop, defaults to false (light mode)
}

const Footer: React.FC<FooterProps> = ({ isDark = false }) => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [Categories, setCategories] = useState<LookupItem[]>([]);
    const [faqTypes, setFaqTypes] = useState<LookupItem[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await homeService.getCategories();
                setCategories(Array.isArray(categories) ? categories.filter(c => c.id !== 0) : []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        const fetchFaqTypes = async () => {
            try {
                const types = await faqService.getFaqTypes();
                setFaqTypes(Array.isArray(types.data) ? types.data : []);
            } catch (error) {
                console.error("Failed to fetch FAQ types", error);
            }
        };
        fetchFaqTypes();

        fetchCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const st = window.pageYOffset || document.documentElement.scrollTop;

            if (st > lastScrollTop) {
                // Scrolling down
                setShowScrollTop(false);
            } else {
                // Scrolling up
                if (st > 500) {
                    setShowScrollTop(true);
                } else {
                    setShowScrollTop(false);
                }
            }

            setLastScrollTop(st <= 0 ? 0 : st);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollTop]);

    const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    return (
        <>
            <a
                href="#/"
                className={`scroll-top ${showScrollTop ? 'show' : ''}`}
                id="scroll-top"
                onClick={scrollToTop}
            >
                <i className="lastudioicon-up-arrow"></i>
            </a>
            <div className={isDark ? 'bg-dark-four dark-footer' : ''}>
                <footer className="footer-section">
                    {/* Footer Widget Section Start */}
                    <div className="footer-widget-section">
                        <div className="container custom-container">
                            <div className="row gy-6">
                                <div className="col-md-4">
                                    {/* Footer Widget Start */}
                                    <div className="footer-widget">
                                        <div className="footer-widget__logo">
                                            {isDark ? (
                                                <Link to={routeUrls.home}>
                                                    <img src="/assets/images/logo-white.svg" alt="Logo" />
                                                </Link>
                                            ) : (
                                                <Link to={routeUrls.home}>
                                                    <img src="/assets/images/logo-black.svg" alt="Logo" />
                                                </Link>
                                            )}
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
                                                {Categories.map((category) => (
                                                    <li key={category.id}>
                                                        <a href="/coming-soon">{category.nameEn}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* Footer Widget End */}

                                        {/* Footer Widget Start */}
                                        <div className="footer-widget flex-grow-1">
                                            <h4 className="footer-widget__title">Services</h4>
                                            <ul className="footer-widget__link">
                                                {faqTypes.map((type) => {
                                                    const slug = type.nameEn
                                                        .toLowerCase()
                                                        .replace(/&/g, 'and')                 // optional: keep meaning
                                                        .replace(/[^a-z0-9]+/g, '-')          // anything not a–z/0–9 → hyphen
                                                        .replace(/^-+|-+$/g, '');             // trim leading/trailing hyphens

                                                    return (
                                                        <li key={type.id}>
                                                            <Link
                                                                to={generatePath(routeUrls.faqs, {
                                                                    typeId: type.id.toString(),
                                                                    typeName: slug,
                                                                })}
                                                            >
                                                                {type.nameEn}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>

                                        </div>
                                        {/* Footer Widget End */}

                                        {/* Footer Widget Start */}
                                        <div className="footer-widget flex-grow-1">
                                            <h4 className="footer-widget__title">Information</h4>
                                            <ul className="footer-widget__link">
                                                <li>
                                                    <Link to={routeUrls.about}>
                                                        About
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link to={routeUrls.comingSoon}>
                                                        Shop
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link to={routeUrls.comingSoon}>
                                                        Our Dates
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link to={routeUrls.contactUs}>
                                                        Contact Us
                                                    </Link>
                                                </li>
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
                                    &copy; {new Date().getFullYear()} <strong>Nawa Home Of Dates</strong> Made with{" "}
                                    <i className="lastudioicon-heart-1"></i> by{" "}
                                    JS
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Footer Copyright End */}
                </footer>
            </div>
        </>
    );
};

export default Footer;