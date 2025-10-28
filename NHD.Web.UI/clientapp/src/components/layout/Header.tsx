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
                                        <a href="#" className="menu-item-link active">
                                            <span>Home</span>
                                        </a>
                                        <ul className="sub-menu">
                                            <li>
                                                <a className="sub-item-link" href="index.html">
                                                    <span>Cake Shop 01</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-2.html">
                                                    <span>Cake Shop 02</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-3.html">
                                                    <span>Cake Shop 03</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-4.html">
                                                    <span>Cake Shop 04</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-5.html">
                                                    <span>Cake Shop 05</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-6.html">
                                                    <span>Cake Shop 06</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-7.html">
                                                    <span>Bread Shop</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-8.html">
                                                    <span>Bread Shop 02</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="sub-item-link" href="index-9.html">
                                                    <span>Cake Shop Fullscreen</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </li>

                                    {/* Shop Mega Menu */}
                                    <li className="position-static">
                                        <a className="menu-item-link" href="#">
                                            <span>Shop</span>
                                        </a>
                                        <ul className="sub-menu sub-menu-mega">
                                            <li className="mega-menu-item">
                                                <ul>
                                                    <li className="mega-menu-item-title">Shop Layouts</li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-right-sidebar.html">
                                                            <span>Shop Right Sidebar</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-left-sidebar.html">
                                                            <span>Shop Left Sidebar</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop.html">
                                                            <span>Shop 4 Columns</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-five-columns.html">
                                                            <span>Shop 5 Columns</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </li>
                                            <li className="mega-menu-item">
                                                <ul>
                                                    <li className="mega-menu-item-title">Product Types</li>
                                                    <li>
                                                        <a className="sub-item-link" href="single-product.html">
                                                            <span>Product Simple</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="single-product-grouped.html">
                                                            <span>Product Grouped</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="single-product-variable.html">
                                                            <span>Product Variable</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="single-product-affiliate.html">
                                                            <span>Product Affiliate</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="single-product-Custom.html">
                                                            <span>Custom Layout</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </li>
                                            <li className="mega-menu-item">
                                                <ul>
                                                    <li className="mega-menu-item-title">Others</li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-account.html">
                                                            <span>My Account</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-cart.html">
                                                            <span>Cart</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-wishlist.html">
                                                            <span>Wishlist</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-checkout.html">
                                                            <span>Checkout</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-compare.html">
                                                            <span>Compare</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="sub-item-link" href="shop-order-tracking.html">
                                                            <span>Order Tracking</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </li>
                                            <li className="mega-menu-item banner-menu-content-wrap">
                                                <ul>
                                                    <li>
                                                        <a href="shop.html">
                                                            <img
                                                                src="assets/images/product/featured-product-01.png"
                                                                alt="Shop"
                                                            />
                                                        </a>
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>

                                    {/* Other Menu Items */}
                                    <li>
                                        <a className="menu-item-link" href="#">
                                            <span>Pages</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="menu-item-link" href="#">
                                            <span>Blog</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="menu-item-link" href="contact.html">
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
                                    <li>
                                        <button className="action search-open">
                                            <i className="lastudioicon-zoom-1" />
                                        </button>
                                    </li>
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