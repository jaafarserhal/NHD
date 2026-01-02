import React, { useEffect, useState, useMemo, useRef } from "react";
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

    // Use ref to track if categories have been loaded
    const categoriesLoadedRef = useRef(false);

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    const [selectedProduct, setSelectedProduct] = useState<ProductsWithGallery | null>(null);
    const handleQuickView = (product: ProductsWithGallery) => setSelectedProduct(product);

    const [page, setPage] = useState(1);
    const pageSize = 6;
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Debounce search query - only search after 3 characters or if empty
    useEffect(() => {
        // If search is empty or has 3+ characters, debounce it
        if (searchQuery.length === 0 || searchQuery.length >= 3) {
            const timer = setTimeout(() => {
                setDebouncedSearchQuery(searchQuery);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            // If less than 3 characters (but not empty), clear the debounced query
            setDebouncedSearchQuery("");
        }
    }, [searchQuery]);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Only fetch categories if not already loaded
                const requests: Promise<any>[] = [
                    productService.getAllProducts(
                        page,
                        pageSize,
                        selectedCategory ?? 0,
                        debouncedSearchQuery
                    )
                ];

                if (!categoriesLoadedRef.current) {
                    requests.push(productService.getCategories());
                }

                const results = await Promise.all(requests);

                if (cancelled) return;

                // Handle products
                const productsRes = results[0] as any;
                setProducts(productsRes.data ?? []);
                setTotalPages(productsRes.totalPages ?? 1);
                setTotalResults(productsRes.total ?? 0);

                // Handle categories (only on first load)
                if (!categoriesLoadedRef.current && results.length > 1) {
                    const categoriesRes = results[1];
                    setCategories(categoriesRes.data ?? []);

                    // Set first category as selected
                    if (categoriesRes.data && categoriesRes.data.length > 0) {
                        setSelectedCategory(categoriesRes.data[0].id);
                    }

                    categoriesLoadedRef.current = true;
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Error loading shop data:", err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        // Only fetch if categories are loaded OR this is the first load
        if (categoriesLoadedRef.current || !categoriesLoadedRef.current) {
            fetchData();
        }

        return () => {
            cancelled = true;
        };
    }, [page, selectedCategory, debouncedSearchQuery]);

    // Reset to page 1 when category or search changes
    useEffect(() => {
        if (categoriesLoadedRef.current) {
            setPage(1);
        }
    }, [selectedCategory, debouncedSearchQuery]);

    // Preload image
    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

    // Derived filtered list (fast, memoized)
    const visibleProducts = useMemo(() => {
        if (!selectedCategory) return products;
        return products.filter(p => p.categoryId === selectedCategory);
    }, [products, selectedCategory]);

    const startIndex = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = totalResults === 0 ? 0 : Math.min(startIndex + visibleProducts.length - 1, totalResults);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
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
                <div className="container" style={{
                    position: 'relative',
                    minHeight: loading ? '400px' : 'auto'
                }}>
                    <Loader loading={loading} fullscreen={false} isDark />
                    <div className="row flex-md-row-reverse">
                        <div className="col-md-8 section-padding-04">

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

                            {!loading && totalPages > 1 && (
                                <div className="shop-bottombar">
                                    <ul className="pagination">
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