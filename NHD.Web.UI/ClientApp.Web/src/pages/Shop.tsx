import React, { useEffect, useState, useMemo, useRef } from "react";
import Footer from "../components/Common/Footer/Index";
import Loader from "../components/Common/Loader/Index";
import Header from "../components/Common/Header/Index";
import productService from "../api/productService";
import sectionService from '../api/sectionService';
import { LookupItem, ProductsWithGallery } from "../api/common/Types";
import { SectionType } from "../api/common/Enums";
import Product from "../components/Product/Index";
import QuickView from "../components/QuickView/Index";

const Shop: React.FC = () => {
    const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mainLoading, setMainLoading] = useState(true);

    const [products, setProducts] = useState<ProductsWithGallery[]>([]);
    const [categories, setCategories] = useState<LookupItem[]>([]);

    // Use ref to track if initial data has been loaded
    const initialDataLoadedRef = useRef(false);

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    const [selectedProduct, setSelectedProduct] = useState<ProductsWithGallery | null>(null);
    const handleQuickView = (product: ProductsWithGallery) => setSelectedProduct(product);

    const [page, setPage] = useState(1);
    const pageSize = 6;
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [mainSection, setMainSection] = useState<any>(null);

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

    // Load initial data (categories and main section) only once
    useEffect(() => {
        let cancelled = false;

        const loadInitialData = async () => {
            try {
                setMainLoading(true);
                const [categoriesRes, mainSectionRes] = await Promise.all([
                    productService.getCategories(),
                    sectionService.getSectionsByType(SectionType.ShopMainSection, 1)
                ]);

                if (cancelled) return;

                setCategories(categoriesRes.data ?? []);
                setMainSection(mainSectionRes as any);

                // Set first category as selected
                if (categoriesRes.data && categoriesRes.data.length > 0) {
                    setSelectedCategory(categoriesRes.data[0].id);
                }

                initialDataLoadedRef.current = true;
                setMainLoading(false);
            } catch (err) {
                if (!cancelled) {
                    console.error("Error loading initial data:", err);
                }
                if (!cancelled) setMainLoading(false);
            }
        };

        if (!initialDataLoadedRef.current) {
            loadInitialData();
        }

        return () => {
            cancelled = true;
        };
    }, []);

    // Load products whenever page, category, or search changes
    useEffect(() => {
        let cancelled = false;

        const fetchProducts = async () => {
            // Wait for initial data to load before fetching products
            if (!initialDataLoadedRef.current) return;

            try {
                setLoading(true);

                const result = await productService.getAllProducts(
                    page,
                    pageSize,
                    selectedCategory ?? 0,
                    debouncedSearchQuery
                );

                if (cancelled) return;
                const productsRes = result as any;
                setProducts(productsRes.data ?? []);
                setTotalPages(productsRes.totalPages ?? 1);
                setTotalResults(productsRes.total ?? 0);
            } catch (err) {
                if (!cancelled) {
                    console.error("Error loading products:", err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, [page, selectedCategory, debouncedSearchQuery]);

    // Reset to page 1 when category or search changes
    useEffect(() => {
        if (initialDataLoadedRef.current) {
            setPage(1);
        }
    }, [selectedCategory, debouncedSearchQuery]);

    // Preload image
    useEffect(() => {
        if (mainSection?.[0].imageUrl) {
            const img = new Image();
            img.src = `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${mainSection?.[0].imageUrl}`;
            img.onload = () => setBannerImageLoaded(true);
        }
    }, [mainSection?.[0].imageUrl]);

    const startIndex = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = totalResults === 0 ? 0 : Math.min(startIndex + products.length - 1, totalResults);

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
            <Loader loading={mainLoading} />
            <Header />
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${mainSection?.[0].imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: bannerImageLoaded ? 1 : 0.9,
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
                                {products.map(product => (
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