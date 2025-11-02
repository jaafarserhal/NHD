import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip, Box } from '@mui/material';
import Footer from 'src/components/Footer';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';
import ConfirmDialog from 'src/components/ConfirmDialog/Index';
import { useNavigate } from 'react-router-dom';
import { RouterUrls } from 'src/common/RouterUrls';
import { getImageSrc } from 'src/common/getImageSrc';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function Products() {
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();

    // Convert 0-based page to 1-based for API
    const { data: products, loading, error, refetch } = useApiCall(
        () => productService.getProducts(page + 1, limit),
        [page, limit] // Dependencies to refetch when page/limit changes
    );

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedProduct) return;
        try {
            await productService.deleteProduct(selectedProduct.id);
            setConfirmOpen(false);
            setSelectedProduct(null);
            refetch(); // refresh table
        } catch (err) {
            console.error("Delete failed:", err);
            setConfirmOpen(false);
        }
        setConfirmOpen(false);
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setSelectedProduct(null);
    };

    const columns = [
        {
            key: 'createdAt',
            label: 'Date',
            render: (prd) => {
                return (
                    <span>
                        {new Date(prd.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(prd.createdAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: false,
                        })}
                    </span>
                );
            }
        },
        {
            key: 'nameEn',
            label: 'Name',
        },
        {
            key: 'category',
            label: 'Category'
        },
        {
            key: 'type',
            label: 'Type'
        },
        {
            key: 'size',
            label: 'Size'
        },
        {
            key: 'isCarousel',
            label: 'Status',
            render: (prd) => (
                <Chip
                    label={prd.isCarousel ? 'Carousel' : 'Regular'}
                    color={prd.isCarousel ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            key: 'fromPrice',
            label: 'Price'
        },
        {
            key: 'imageUrl',
            label: 'Image',
            render: (prd) => (
                <LazyLoadImage
                    src={getImageSrc(prd.imageUrl, 'products')}
                    alt={prd.name}
                    effect="blur"
                    width="50px"
                    height="50px"
                    style={{
                        objectFit: 'cover',
                        borderRadius: '4px'
                    }}
                />
            )
        }
        ,
        {
            key: 'isActive',
            label: 'Status',
            render: (prd) => (
                <Chip
                    label={prd.isActive ? 'Active' : 'Inactive'}
                    color={prd.isActive ? 'success' : 'error'}
                    size="small"
                />
            )
        }
    ];

    // Handle pagination changes
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(0); // Reset to first page when changing page size
    };

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography color="error">Error loading Products: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            overflow="hidden"
        >
            <Helmet>
                <title>Products - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Products" href={RouterUrls.productAdd} />
            </PageTitleWrapper>

            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {!products || !products.data || products.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No Products found.
                    </Typography>
                ) : (
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="stretch"
                        spacing={3}
                        sx={{ flex: 1 }}
                    >
                        <Grid item xs={12}>
                            <GenericTable
                                data={products.data}
                                idKey="id"
                                columns={columns}
                                onEdit={(prd) => navigate(`/products/edit/${prd.id}`)}
                                onDelete={(prd) => handleDeleteClick(prd)}
                                onManage={(prd) => navigate(`/products/gallery/${prd.id}`)}
                                currentPage={page}
                                pageSize={limit}
                                totalCount={products.total || products.data.length}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handleLimitChange}
                                disableInternalPagination={true}
                            />
                        </Grid>
                    </Grid>
                )}
            </Container>
            <ConfirmDialog
                open={confirmOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Box"
                message={`Are you sure you want to delete this item? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
            />
        </Box>
    );
}

export default Products;