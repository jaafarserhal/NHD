import React, { useEffect, useState, useMemo } from "react";
import Footer from "../components/Common/Footer/Index";
import Loader from "../components/Common/Loader/Index";
import Header from "../components/Common/Header/Index";
import productService from "../api/productService";
import { LookupItem, ProductsWithGallery } from "../api/common/Types";
import Product from "../components/Product/Index";
import QuickView from "../components/QuickView/Index";

const Shop: React.FC = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    const [products, setProducts] = useState<ProductsWithGallery[]>([]);
    const [categories, setCategories] = useState<LookupItem[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedProduct, setSelectedProduct] = useState<ProductsWithGallery | null>(null);
    const handleQuickView = (product: ProductsWithGallery) => setSelectedProduct(product);

    const [page, setPage] = useState(1);
    const pageSize = 6;     // matches 3×2 grid
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);


    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);

                const [productsRes, categoriesRes] = await Promise.all([
                    productService.getAllProducts(
                        page,
                        pageSize,
                        selectedCategory ?? 0,
                        searchQuery
                    ),
                    productService.getCategories()
                ]);

                if (cancelled) return;

                var result = productsRes as any;
                setProducts(result.data ?? []);
                setTotalPages(result.totalPages ?? 1);
                setTotalResults(result.total ?? 0);
                setCategories(categoriesRes.data ?? []);

                // Set first category as active on initial load
                if (isInitialLoad && categoriesRes.data && categoriesRes.data.length > 0) {
                    setSelectedCategory(categoriesRes.data[0].id);
                    setIsInitialLoad(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Error loading shop data:", err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [page, pageSize, selectedCategory, searchQuery]);


    // Reset to page 1 when category or search changes
    useEffect(() => {
        setPage(1);
    }, [selectedCategory, searchQuery]);

    // 🖼️ preload image
    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

    // ✅ derived filtered list (fast, memoized)
    const visibleProducts = useMemo(() => {
        if (!selectedCategory) return products;
        return products.filter(p => p.categoryId === selectedCategory);
    }, [products, selectedCategory]);

    const startIndex =
        totalResults === 0 ? 0 : (page - 1) * pageSize + 1;

    const endIndex =
        totalResults === 0
            ? 0
            : Math.min(startIndex + visibleProducts.length - 1, totalResults);

    // Pagination handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Search handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // The search will trigger automatically via the searchQuery state change
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show smart pagination with ellipsis logic
            if (page <= 3) {
                // Near start
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                // Near end
                pages.push(1);
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle
                pages.push(1);
                pages.push(page - 1);
                pages.push(page);
                pages.push(page + 1);
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <>
            <Header />
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: "url(/assets/images/banner/contact-us-banner.webp)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: imageLoaded ? 1 : 0.9,
                    transition: "opacity 0.3s ease-in-out"
                }}
            />

            <div className="shop-product-section sidebar-left overflow-hidden">
                <div className="container">

                    <div className="row flex-md-row-reverse">
                        <div className="col-md-8 section-padding-04" style={{
                            position: 'relative',
                            minHeight: loading ? '400px' : 'auto'
                        }}>
                            {loading && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    minHeight: '400px'
                                }}>
                                    <img
                                        src="/assets/images/logo-white.svg"
                                        className="loader-logo"
                                        alt="logo"
                                        style={{
                                            maxWidth: '150px',
                                            animation: 'pulse 1.5s ease-in-out infinite'
                                        }}
                                    />
                                </div>
                            )}
                            <div className="shop-topbar">
                                <div className="shop-topbar-item shop-topbar-left">
                                    Showing {startIndex} - {endIndex} of {totalResults} results
                                </div>
                            </div>

                            <div className="row row-cols-xl-3 row-cols-lg-2 row-cols-sm-2 row-cols-1 mb-n50" >
                                {visibleProducts.map(product => (
                                    <Product
                                        key={product.id}
                                        product={product}
                                        onQuickView={handleQuickView}
                                        isByCategory={true}
                                        modalId="allProductModal"
                                    />
                                ))}

                                {!loading && products.length === 0 && (
                                    <p className="text-center">No products found.</p>
                                )}

                                <QuickView product={selectedProduct} modalId="allProductModal" />
                            </div>

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="shop-bottombar">
                                    <ul className="pagination">
                                        {/* Previous button */}
                                        <li className={page === 1 ? "prev-disabled" : ""}>
                                            <a
                                                href="#prev"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(page - 1);
                                                }}
                                            >
                                                ←
                                            </a>
                                        </li>

                                        {/* Page numbers */}
                                        {getPageNumbers().map((pageNum, idx) => (
                                            <li key={idx}>
                                                <a
                                                    className={page === pageNum ? "active" : ""}
                                                    href={`#page=${pageNum}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(pageNum);
                                                    }}
                                                >
                                                    {pageNum}
                                                </a>
                                            </li>
                                        ))}

                                        {/* Next button */}
                                        <li className={page === totalPages ? "next-disabled" : ""}>
                                            <a
                                                href="#next"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(page + 1);
                                                }}
                                            >
                                                →
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="col-md-4">
                            <div className="sidebars">
                                <div className="sidebars_inner">

                                    <form
                                        onSubmit={handleSearch}
                                        className="sidebars_search"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Search Here"
                                            className="sidebars_search__input"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="sidebars_search__btn"
                                        >
                                            <i className="lastudioicon-zoom-1"></i>
                                        </button>
                                    </form>

                                    <div className="sidebars_widget">
                                        <h3 className="sidebars_widget__title">Category</h3>
                                        <ul className="sidebars_widget__category">
                                            {categories.map(category => (
                                                <li key={category.id}>
                                                    <a
                                                        onClick={() => setSelectedCategory(category.id)}
                                                        style={{
                                                            color: selectedCategory === category.id ? '#d3a971' : '#555555',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {category.nameEn}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="sidebars_widget">
                                        <h3 className="sidebars_widget__title">Instagram</h3>
                                        <ul className="sidebars_widget__instagram">
                                            <li>
                                                <a className="instagram-thumb" href="#">
                                                    <img src="/assets/images/instagram/widget-insta-1.jpg" alt="Image" />
                                                    <i className="lastudioicon lastudioicon-b-instagram"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="instagram-thumb" href="#">
                                                    <img src="/assets/images/instagram/widget-insta-2.jpg" alt="Image" />
                                                    <i className="lastudioicon lastudioicon-b-instagram"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="instagram-thumb" href="#">
                                                    <img src="/assets/images/instagram/widget-insta-3.jpg" alt="Image" />
                                                    <i className="lastudioicon lastudioicon-b-instagram"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="instagram-thumb" href="#">
                                                    <img src="/assets/images/instagram/widget-insta-4.jpg" alt="Image" />
                                                    <i className="lastudioicon lastudioicon-b-instagram"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer isDark={true} />
        </>
    );
};

export default Shop;