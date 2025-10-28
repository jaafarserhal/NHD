import React from "react";

const Products: React.FC = () => {
    return (
        <div className="section-padding-01">
            <div className="container">
                {/* Section Title Start */}
                <div className="section-title text-center max-width-720 mx-auto">
                    <h2 className="section-title__title">FOR A SWEET DAY</h2>
                    <p>
                        Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis
                        ullamco cillum dolor. Voluptate exercitation incididunt
                    </p>
                </div>
                {/* Section Title End */}

                <div className="row g-6 gx-lg-10">
                    {/* Product Item 1 */}
                    <div className="col-lg-4 col-md-6">
                        <div className="product-item border text-center">
                            <div className="product-item__badge">Hot</div>
                            <div className="product-item__image">
                                <a href="single-product.html">
                                    <img
                                        width={350}
                                        height={350}
                                        src="assets/images/product/product-1.jpg"
                                        alt="Product"
                                    />
                                </a>
                                <ul className="product-item__meta meta-middle">
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-quickview"
                                            href="#"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Quick View"
                                            data-bs-toggle="modal"
                                            data-bs-target="#exampleProductModal"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-cart"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Select options"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalCart"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-wishlist"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Add to wishlist"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalWishlist"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-compare"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Add to compare"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalCompare"
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div className="product-item__content pb-3">
                                <h5 className="product-item__title">
                                    <a href="single-product.html">Italian Loaf</a>
                                </h5>
                                <span className="product-item__price fs-2">$4.99</span>
                                <a href="single-product.html" className="product-item__arrow">
                                    <img
                                        width={40}
                                        height={15}
                                        src="assets/images/arrow.svg"
                                        alt="arrow"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Product Item 2 */}
                    <div className="col-lg-4 col-md-6">
                        <div className="product-item border text-center">
                            <div className="d-none">Hot</div>
                            <div className="product-item__image">
                                <a href="single-product.html">
                                    <img
                                        width={350}
                                        height={350}
                                        src="assets/images/product/product-2.jpg"
                                        alt="Product"
                                    />
                                </a>
                                <ul className="product-item__meta meta-middle">
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-quickview"
                                            href="#"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Quick View"
                                            data-bs-toggle="modal"
                                            data-bs-target="#exampleProductModal"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-cart"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Select options"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalCart"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-wishlist"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Add to wishlist"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalWishlist"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-compare"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Add to compare"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalCompare"
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div className="product-item__content pb-3">
                                <h5 className="product-item__title">
                                    <a href="single-product.html">Croissant Italy Cake</a>
                                </h5>
                                <span className="product-item__price fs-2">$5.00</span>
                                <a href="single-product.html" className="product-item__arrow">
                                    <img
                                        width={40}
                                        height={15}
                                        src="assets/images/arrow.svg"
                                        alt="arrow"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Product Item 3 */}
                    <div className="col-lg-4 col-md-6">
                        <div className="product-item border text-center">
                            <div className="d-none">Hot</div>
                            <div className="product-item__image">
                                <a href="single-product.html">
                                    <img
                                        width={350}
                                        height={350}
                                        src="assets/images/product/product-3.jpg"
                                        alt="Product"
                                    />
                                </a>
                                <ul className="product-item__meta meta-middle">
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-quickview"
                                            href="#"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Quick View"
                                            data-bs-toggle="modal"
                                            data-bs-target="#exampleProductModal"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-cart"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Select options"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalCart"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-wishlist"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Add to wishlist"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalWishlist"
                                        />
                                    </li>
                                    <li className="product-item__meta-action">
                                        <a
                                            className="labtn-icon-compare"
                                            href="#/"
                                            data-bs-tooltip="tooltip"
                                            data-bs-placement="top"
                                            title="Add to compare"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalCompare"
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div className="product-item__content pb-3">
                                <h5 className="product-item__title">
                                    <a href="single-product.html">Chocolate Muffin</a>
                                </h5>
                                <span className="product-item__price fs-2">$7.55</span>
                                <a href="single-product.html" className="product-item__arrow">
                                    <img
                                        width={40}
                                        height={15}
                                        src="assets/images/arrow.svg"
                                        alt="arrow"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
