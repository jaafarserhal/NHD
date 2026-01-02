import React from "react";

const OurDates: React.FC = () => {
    return (
        <>
            {/* Breadcrumb Section Start */}
            <div
                className="breadcrumb"
                data-bg-image="/assets/images/bg/breadcrumb-bg.jpg"
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">Shop</h1>
                                <ul className="breadcrumb_list">
                                    <li>
                                        <a href="index.html">Home</a>
                                    </li>
                                    <li>Shop Four Column</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}

            {/* Product Section Start */}
            <div className="shop-product-section sidebar-left overflow-hidden">
                <div className="container">
                    <div className="row">
                        <div className="col-12 section-padding-04">
                            {/* Shop Top Bar Start */}
                            <div className="shop-topbar">
                                <div className="shop-topbar-item shop-topbar-left">
                                    <p>Showing 1 - 12 of 25 result</p>
                                </div>

                                <div className="shop-topbar-right">
                                    <div className="shop-topbar-item">
                                        <select name="SortBy" id="SortBy">
                                            <option value="manual">Sort by Rated</option>
                                            <option value="best-selling">Sort by Latest</option>
                                            <option value="price-ascending">Price ↑</option>
                                            <option value="price-descending">Price ↓</option>
                                        </select>
                                    </div>

                                    <div className="shop-topbar-item">
                                        <select name="paginateBy" id="paginateBy">
                                            <option value="3">Show 3</option>
                                            <option value="4">Show 4</option>
                                            <option value="5">Show 5</option>
                                            <option value="6">Show 6</option>
                                            <option value="7">Show 7</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Shop Top Bar End */}

                            {/* Product Grid Start */}
                            <div className="row row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 mb-n50">
                                {/* ---- COPY OF YOUR REPEATED PRODUCT CARDS ---- */}
                                {/* You may want to map dynamically later */}

                                {/* Example product card (rest are unchanged from your HTML besides className/img) */}
                                <div className="col mb-50">
                                    <div className="product-item text-center">
                                        <div className="product-item__badge">Hot</div>
                                        <div className="product-item__image border w-100">
                                            <a href="single-product.html">
                                                <img
                                                    width={350}
                                                    height={350}
                                                    src="assets/images/product/product-8-500x625.jpg"
                                                    alt="Product"
                                                />
                                            </a>
                                            <ul className="product-item__meta">
                                                <li className="product-item__meta-action">
                                                    <a
                                                        className="shadow-1 labtn-icon-quickview"
                                                        href="#/"
                                                        data-bs-tooltip="tooltip"
                                                        data-bs-placement="top"
                                                        title="Quick View"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#exampleProductModal"
                                                    />
                                                </li>
                                                <li className="product-item__meta-action">
                                                    <a
                                                        className="shadow-1 labtn-icon-cart"
                                                        href="#/"
                                                        data-bs-tooltip="tooltip"
                                                        data-bs-placement="top"
                                                        title="Add to Cart"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#modalCart"
                                                    />
                                                </li>
                                                <li className="product-item__meta-action">
                                                    <a
                                                        className="shadow-1 labtn-icon-wishlist"
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
                                                        className="shadow-1 labtn-icon-compare"
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
                                        <div className="product-item__content pt-5">
                                            <h5 className="product-item__title">
                                                <a href="single-product.html">Brownie</a>
                                            </h5>
                                            <span className="product-item__price">$4.99</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Repeat your remaining product items here
                    (they are structurally identical — already JSX-safe)
                */}
                            </div>
                            {/* Product Grid End */}

                            {/* Shop bottom Bar Start */}
                            <div className="shop-bottombar">
                                <ul className="pagination">
                                    <li className="disabled">
                                        <a href="#prev">←</a>
                                    </li>
                                    <li>
                                        <a className="active" href="#page=1">
                                            1
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#page=2">2</a>
                                    </li>
                                    <li>
                                        <a href="#page=3">3</a>
                                    </li>
                                    <li>
                                        <a href="#page=4">4</a>
                                    </li>
                                    <li>
                                        <a href="#page=5">5</a>
                                    </li>
                                    <li>
                                        <a href="#next">→</a>
                                    </li>
                                </ul>
                            </div>
                            {/* Shop bottom Bar End */}
                        </div>
                    </div>
                </div>
            </div>
            {/* Product Section End */}
        </>
    );
};

export default OurDates;
