import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
    Grid,
    Container,
    Typography,
    Box,
    Card,
    CardHeader,
    CardContent,
    Divider,
    TextField,
    Button,
    Chip,
    FormControlLabel,
    Switch
} from '@mui/material';
import { useState, useRef } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import GenericTable from 'src/components/GenericTable/index';
import ConfirmDialog from 'src/components/ConfirmDialog/Index';
import { useNavigate, useParams } from 'react-router-dom';
import { RouterUrls } from 'src/common/RouterUrls';
import { getImageSrc } from 'src/common/Utils';
import { Gallery as GalleryItem } from 'src/portal/models/Types';
import { PortalToastContainer } from 'src/components/Toaster/Index';
import PageTitle from 'src/components/PageTitle';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { validateFileSize } from 'src/common/fileValidation';


function Gallery() {
    const { prdId, dateId } = useParams<{ prdId?: string; dateId?: string }>();
    const { title } = useParams<{ title: string }>();
    const navigate = useNavigate();

    const isProductMode = Boolean(prdId);

    // List states
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);

    // Form states
    const [form, setForm] = useState<Omit<GalleryItem, "id" | "imageUrl">>({
        sortOrder: 0,
        altText: "",
        isPrimary: false
    });
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const errorBoxRef = useRef<HTMLDivElement>(null);

    // Fetch products
    const { data: products, loading: productsLoading, error, refetch } = useApiCall(
        () => productService.getGallery(prdId, dateId, page + 1, limit),
        [page, limit]
    );

    // Delete handlers
    const handleDeleteClick = (gallery) => {
        setSelectedGallery(gallery);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedGallery) return;
        try {
            await productService.deleteGallery(selectedGallery.id);
            setConfirmOpen(false);
            setSelectedGallery(null);
            refetch();
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setConfirmOpen(false);
        }
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setSelectedGallery(null);
    };

    // File upload handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            const validation = validateFileSize(file, 2); // 2MB limit
            if (!validation.isValid) {
                setErrors([validation.error!]);
                e.target.value = '';
                setImage(null);
                setPreview(null);

                setTimeout(() => {
                    errorBoxRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
                return;
            }

            setImage(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setImage(null);
            setPreview(null);
        }

        if (errors.length > 0) {
            setErrors([]);
        }
    };

    // Form validation
    const validateForm = () => {
        const validationErrors: string[] = [];

        if (!form.altText.trim()) {
            validationErrors.push("Alt text is required");
        }
        if (form.sortOrder === undefined || form.sortOrder === null) {
            validationErrors.push("Sort order is required");
        }
        if (!image) {
            validationErrors.push("Image is required");
        }

        setErrors(validationErrors);

        if (validationErrors.length > 0) {
            setTimeout(() => {
                errorBoxRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }

        return validationErrors.length === 0;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (!image) throw new Error("Please select an image.");

            const galleryData = {
                ...form,
                imageFile: image
            };

            if (prdId) {
                galleryData.prdId = Number(prdId);
            }
            if (dateId) {
                galleryData.dateId = Number(dateId);
            }

            await productService.addGallery(galleryData);

            // Reset form
            setForm({
                sortOrder: 0,
                altText: "",
                isPrimary: false
            });
            setImage(null);
            setPreview(null);

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Refresh the gallery list
            refetch();
        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to add image. Please try again.']);
        } finally {
            setLoading(false);
        }
    };

    // Table columns
    const columns = [
        {
            key: 'createdAt',
            label: 'Date',
            render: (prd) => (
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
            )
        },
        {
            key: 'name',
            label: 'Product Name'
        },
        {
            key: 'imageUrl',
            label: 'Image',
            render: (prd) => (
                <LazyLoadImage
                    src={getImageSrc(prd.imageUrl, isProductMode ? 'products' : 'dates')}
                    alt={prd.altText}
                    effect="blur"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
            )
        },
        {
            key: 'altText',
            label: 'Alt Text'
        },
        {
            key: 'sortOrder',
            label: 'Sort Order'
        },
        {
            key: 'isPrimary',
            label: 'Primary',
            render: (prd) => (
                <Chip
                    label={prd.isPrimary ? 'Yes' : 'No'}
                    color={prd.isPrimary ? 'success' : 'error'}
                    size="small"
                />
            )
        }
    ];

    // Pagination handlers
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(0);
    };
    const handlePrimarySwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, isPrimary: event.target.checked });
    };

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography color="error">Error loading Galleries: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <>
            <PortalToastContainer />
            <Box display="flex" flexDirection="column" minHeight="100vh" overflow="hidden">
                <Helmet>
                    <title>{title} | Gallery - Applications</title>
                </Helmet>

                <PageTitleWrapper>
                    <PageTitle
                        heading="Gallery"
                        subHeading={`${title} | Manage gallery images`}
                        backUrl={isProductMode ? `${RouterUrls.productsList}` : `${RouterUrls.datesList}`}
                    />
                </PageTitleWrapper>

                <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
                    {/* Add Image Form */}
                    <Box sx={{ mb: 4 }}>
                        {errors.length > 0 && (
                            <Box
                                ref={errorBoxRef}
                                sx={{ mb: 2, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}
                            >
                                {errors.length === 1 ? (
                                    errors[0]
                                ) : (
                                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <Card>
                                <CardHeader title="Add New Image" />
                                <Divider />
                                <CardContent>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                required
                                                name="altText"
                                                label="Alt Text"
                                                value={form.altText}
                                                onChange={(e) => setForm({ ...form, altText: e.target.value })}
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                required
                                                name="sortOrder"
                                                label="Sort Order"
                                                type="number"
                                                value={form.sortOrder}
                                                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                                variant="outlined"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ marginBottom: '1rem' }}
                                                required
                                            />
                                            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 1 }}>
                                                * Image Resolution <span style={{ color: "red" }}>{(isProductMode ? "500 x 625" : form.isPrimary ? "192 x 148" : "350 x 350")}</span>
                                            </Box>

                                            {!preview && (
                                                <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 1 }}>
                                                    * Image is required (max size: 1MB)
                                                </Box>
                                            )}
                                            {preview && (
                                                <Box sx={{ mt: 2 }}>
                                                    <img
                                                        src={preview}
                                                        alt="Preview"
                                                        style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain' }}
                                                    />
                                                </Box>
                                            )}
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={form.isPrimary}
                                                        onChange={handlePrimarySwitchChange}
                                                        name="isPrimary"
                                                    />
                                                }
                                                label='Banner'
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box textAlign="center">
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={loading}
                                                    size="large"
                                                >
                                                    {loading ? "Adding..." : "Add Image"}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </form>
                    </Box>

                    {/* Images List */}
                    <Card>
                        <CardHeader title={`${title} ${isProductMode ? '| Product Gallery' : '| Date Gallery'}`} />
                        <Divider />
                        <CardContent>
                            {productsLoading ? (
                                <Box display="flex" justifyContent="center" p={3}>
                                    <Typography>Loading...</Typography>
                                </Box>
                            ) : !products || !products.data || products.data.length === 0 ? (
                                <Typography variant="h6" color="textSecondary" align="center" py={3}>
                                    No images found.
                                </Typography>
                            ) : (
                                <GenericTable
                                    data={products.data}
                                    idKey="id"
                                    columns={columns}
                                    onDelete={(prd) => handleDeleteClick(prd)}
                                    currentPage={page}
                                    pageSize={limit}
                                    totalCount={products.total || products.data.length}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handleLimitChange}
                                    disableInternalPagination={true}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Container>

                <ConfirmDialog
                    open={confirmOpen}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Delete Image"
                    message="Are you sure you want to delete this item? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmVariant="danger"
                />
            </Box>
        </>
    );
}

export default Gallery;