import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routeUrls } from "../../../api/base/routeUrls";

interface OffcanvasMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const OffcanvasMenu: React.FC<OffcanvasMenuProps> = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="offcanvas-backdrop fade show"
                    onClick={onClose}
                    style={{ zIndex: 1040 }}
                />
            )}

            <div
                className={`offcanvas offcanvas-end bg-secondary ${isOpen ? "show" : ""}`}
                style={{ visibility: isOpen ? "visible" : "hidden", zIndex: 1050 }}
            >
                <div className="offcanvas-header justify-content-end">
                    <button
                        type="button"
                        className="btn-close text-white"
                        onClick={onClose}
                    >
                        <i className="lastudioicon-e-remove" />
                    </button>
                </div>

                <div className="offcanvas-body">
                    <ul className="mobile-primary-menu">
                        <li>
                            <Link to={routeUrls.home} className="menu-item-link" onClick={onClose}>
                                <span>Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={routeUrls.about} className="menu-item-link" onClick={onClose}>
                                <span>About</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={routeUrls.shop} className="menu-item-link" onClick={onClose}>
                                <span>Shop</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={routeUrls.comingSoon} className="menu-item-link" onClick={onClose}>
                                <span>Our Dates</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={routeUrls.contactUs} className="menu-item-link" onClick={onClose}>
                                <span>Contact</span>
                            </Link>
                        </li>
                    </ul>
                    <ul className="hotline-wrapper offcanvas-hotline">
                        <li>
                            <div className="hotline">
                                <i className="lastudioicon lastudioicon-support248"></i>
                                <div className="hotline-content">
                                    <span className="hotline-text">Hotline</span>
                                    <a className="hotline-link" href="tel:+46720488396">+46 72 048 83 96</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="hotline">
                                <i className="lastudioicon lastudioicon-pin-check"></i>
                                <div className="hotline-content">
                                    <span className="hotline-text">Store Location</span>
                                    <a className="hotline-link" href="#/">Kölgatan 3  216 47 limhamn Sweden</a>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default OffcanvasMenu;
