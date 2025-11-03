import React, { useState, useEffect } from "react";

const Header: React.FC = () => {
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;

            if (scrollPosition <= 0) {
                setIsSticky(false);
            } else {
                setIsSticky(true);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            {/* Header Start */}
            <div className={`header-section header-transparent header-sticky ${isSticky ? 'sticky' : ''}`}>
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-lg-3 col-xl-3 col-7">
                            {/* Header Logo Start */}
                            <div className="header-logo">
                                <a href="index.html">
                                    <img
                                        className="white-logo"
                                        src={isSticky ? "assets/images/logo.svg" : "assets/images/logo-white.svg"}
                                        width={229}
                                        height={62}
                                        alt="Logo"
                                    />
                                </a>
                            </div>
                            {/* Header Logo End */}
                        </div>

                        <div className="col-lg-7 col-xl-6 d-none d-lg-block">
                            {/* Header Menu Start */}
                            <div className="header-menu">
                                <ul className="header-primary-menu d-flex justify-content-center">
                                    <li>
                                        <a href="/" className="menu-item-link active">
                                            <span>Home</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/shop" className="menu-item-link active">
                                            <span>Shope</span>
                                        </a>
                                    </li>

                                    <li>
                                        <a href="#" className="menu-item-link active">
                                            <span>Products</span>
                                        </a>
                                    </li>

                                    <li>
                                        <a href="/about" className="menu-item-link active">
                                            <span>About</span>
                                        </a>
                                    </li>

                                    <li>
                                        <a href="#" className="menu-item-link active">
                                            <span>Contact</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {/* Header Menu End */}
                        </div>

                        <div className="col-lg-2 col-xl-3 col-5">
                            {/* Header Meta Start */}
                            <div className="header-meta">
                                <ul className="header-meta__action d-flex justify-content-end">
                                    {/* <li>
                                        <button className="action search-open">
                                            <i className="lastudioicon-zoom-1" />
                                        </button>
                                    </li> */}
                                    <li>
                                        <button
                                            className="action"
                                            data-bs-toggle="offcanvas"
                                            data-bs-target="#offcanvasCart"
                                        >
                                            <i className="lastudioicon-shopping-cart-2" />
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                                                3
                                            </span>
                                        </button>
                                    </li>
                                    <li>
                                        <a className="action" href="shop-account.html">
                                            <i className="lastudioicon-single-01-2" />
                                        </a>
                                    </li>
                                    <li className="d-lg-none">
                                        <button
                                            className="action"
                                            data-bs-toggle="offcanvas"
                                            data-bs-target="#offcanvasMenu"
                                        >
                                            <i className="lastudioicon-menu-8-1" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            {/* Header Meta End */}
                        </div>
                    </div>
                </div>
            </div>
            {/* Header End */}
        </>
    );
};

export default Header;