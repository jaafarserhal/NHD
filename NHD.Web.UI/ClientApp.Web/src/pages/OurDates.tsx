import React, { useEffect, useState, useRef } from "react";
import Footer from "../components/Common/Footer/Index";
import Loader from "../components/Common/Loader/Index";
import Header from "../components/Common/Header/Index";
import dateService from "../api/dateService";
import sectionService from '../api/sectionService';
import { ProductsWithGallery } from "../api/common/Types";
import { SectionType } from "../api/common/Enums";
import Product from "../components/Product/Index";


const OurDates: React.FC = () => {
    const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mainLoading, setMainLoading] = useState(true);

    const [products, setProducts] = useState<ProductsWithGallery[]>([]);

    // Use ref to track if initial data has been loaded
    const initialDataLoadedRef = useRef(false);

    const [page, setPage] = useState(1);
    const pageSize = 12; // Adjusted to match "Show 12" from original
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [mainSection, setMainSection] = useState<any>(null);

    // Load initial data and first page of products
    useEffect(() => {
        let cancelled = false;

        const loadInitialData = async () => {
            try {
                setMainLoading(true);
                setLoading(true);

                // Load section and products in parallel
                const [mainSectionRes, productsResult] = await Promise.all([
                    sectionService.getSectionsByType(SectionType.OurDatesMainSection, 1),
                    dateService.getDates(page, pageSize)
                ]);

                if (cancelled) return;

                setMainSection(mainSectionRes as any);

                const productsRes = productsResult as any;
                setProducts(productsRes.data ?? []);
                setTotalPages(productsRes.totalPages ?? 1);
                setTotalResults(productsRes.total ?? 0);

                initialDataLoadedRef.current = true;
                setMainLoading(false);
                setLoading(false);
            } catch (err) {
                if (!cancelled) {
                    console.error("Error loading initial data:", err);
                    setMainLoading(false);
                    setLoading(false);
                }
            }
        };

        if (!initialDataLoadedRef.current) {
            loadInitialData();
        }

        return () => {
            cancelled = true;
        };
    }, []);

    // Load products when page changes (after initial load)
    useEffect(() => {
        // Skip if this is the initial load
        if (!initialDataLoadedRef.current) return;

        let cancelled = false;

        const fetchProducts = async () => {
            try {
                setLoading(true);

                const result = await dateService.getDates(
                    page,
                    pageSize
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
    }, [page]);

    // Preload image
    useEffect(() => {
        let isMounted = true;
        const imageUrl = mainSection?.[0]?.imageUrl;

        if (!imageUrl) {
            setBannerImageLoaded(false);
            return;
        }

        const img = new Image();
        img.src = `${process.env.REACT_APP_BASE_URL || ""}/uploads/sections/${imageUrl}`;

        img.onload = () => {
            if (isMounted) setBannerImageLoaded(true);
        };

        return () => {
            isMounted = false;
        };
    }, [mainSection]);

    const startIndex = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = totalResults === 0 ? 0 : Math.min(startIndex + products.length - 1, totalResults);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

            {/* Breadcrumb Section */}
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: mainSection?.[0]?.imageUrl
                        ? `url(${process.env.REACT_APP_BASE_URL || ""}/uploads/sections/${mainSection?.[0]?.imageUrl})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: bannerImageLoaded ? 1 : 0.9,
                    transition: "opacity 0.3s ease-in-out"
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">{mainSection?.[0]?.titleEn ?? ""}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Section */}
            <div className="shop-product-section sidebar-left overflow-hidden">
                <div className="container" style={{
                    position: 'relative',
                    minHeight: loading ? '400px' : 'auto'
                }}>
                    <Loader loading={loading} fullscreen={false} isDark />
                    <div className="row">
                        <div className="col-12 section-padding-04">

                            {/* Shop Top Bar */}
                            <div className="shop-topbar">
                                <div className="shop-topbar-item shop-topbar-left">
                                    Showing {startIndex} - {endIndex} of {totalResults} results
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="row row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 mb-n50">
                                {products.map(product => (
                                    <Product
                                        key={product.id}
                                        product={product}
                                        urlPrefix="/dates"
                                    />
                                ))}

                                {!loading && products.length === 0 && (
                                    <div className="col-12">
                                        <p className="text-center">No Dates found.</p>
                                    </div>
                                )}
                            </div>

                            {/* Shop Bottom Bar - Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="shop-bottombar">
                                    <ul className="pagination">
                                        <li className={page === 1 ? "disabled" : ""}>
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

                                        <li className={page === totalPages ? "disabled" : ""}>
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
                    </div>
                </div>
            </div>

            <Footer isDark={true} />
        </>
    );
};

export default OurDates;