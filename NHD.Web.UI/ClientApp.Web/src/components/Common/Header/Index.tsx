import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeUrls } from "../../../api/base/routeUrls";
import Loader from "../Loader/Index";
import { storage } from "../../../api/base/storage";

const Header: React.FC = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const token = storage.get('webAuthToken');
    const location = useLocation();
    const navigate = useNavigate();

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
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const toggleAccountMenu = () => {
        setShowAccountMenu((prev) => !prev);
    };

    const logOut = () => {
        setLoading(true);
        setTimeout(() => {
            storage.remove('webAuthToken');
            setShowAccountMenu(false);
            setLoading(false);
            navigate(routeUrls.login);
        }, 3000);
    };

    return (
        <>
            <Loader loading={loading} />
            <div className={`header-section header-transparent header-sticky ${isSticky ? 'sticky' : ''}`}>
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-lg-3 col-xl-3 col-7">
                            <div className="header-logo">
                                <a href="/">
                                    <img
                                        className="white-logo"
                                        src={isSticky ? "/assets/images/logo-black.svg" : "/assets/images/logo-white.svg"}
                                        width={229}
                                        height={62}
                                        alt="Logo"
                                    />
                                </a>
                            </div>
                        </div>

                        <div className="col-lg-7 col-xl-6 d-none d-lg-block">
                            <div className="header-menu">
                                <ul className="header-primary-menu d-flex justify-content-center">
                                    <li>
                                        <Link to={routeUrls.home} className={`menu-item-link ${isActive(routeUrls.home) ? 'active' : ''}`}>
                                            <span>Home</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={routeUrls.about} className={`menu-item-link ${isActive(routeUrls.about) ? 'active' : ''}`}>
                                            <span>About</span>
                                        </Link>
                                    </li>
                                    <li><a href="/coming-soon" className="menu-item-link"><span>Shop</span></a></li>
                                    <li><a href="/coming-soon" className="menu-item-link"><span>Our Dates</span></a></li>
                                    <li><Link to={routeUrls.contactUs} className="menu-item-link"><span>Contact</span></Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-lg-2 col-xl-3 col-5">
                            <div className="header-meta position-relative">
                                <ul className="header-meta__action d-flex justify-content-end">
                                    <li>
                                        <button className="action" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart">
                                            <i className="lastudioicon-shopping-cart-2" />
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">3</span>
                                        </button>
                                    </li>

                                    {/* Account Dropdown */}
                                    <li className="position-relative">
                                        <button className="action" onClick={toggleAccountMenu}>
                                            <i className="lastudioicon-single-01-2" />
                                        </button>

                                        {showAccountMenu && (
                                            <div className="account-dropdown-menu position-absolute end-0 mt-2 p-3 bg-white shadow rounded" style={{ minWidth: '150px', zIndex: 1000 }}>
                                                <ul className="list-unstyled m-0 p-0">
                                                    <li className="py-1">
                                                        <Link to={token ? routeUrls.myAccount : routeUrls.login} className="dropdown-item">My Account</Link>
                                                    </li>
                                                    <li className="py-1">
                                                        {!token ? (
                                                            <Link to={routeUrls.register} className="dropdown-item">
                                                                Create Account
                                                            </Link>
                                                        ) : (
                                                            <button onClick={logOut} className="dropdown-item">
                                                                Log Out
                                                            </button>
                                                        )}
                                                    </li>

                                                </ul>
                                            </div>
                                        )}
                                    </li>

                                    <li className="d-lg-none">
                                        <button className="action" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu">
                                            <i className="lastudioicon-menu-8-1" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
