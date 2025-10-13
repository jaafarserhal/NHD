import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField, Backdrop, CircularProgress } from "@mui/material";
import { Product, DatesProduct } from "../models/Types";
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import { Helmet } from "react-helmet-async";
import Footer from "src/components/Footer";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import Editor from "src/components/Editor/Index";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { BoxCategoryEnum, BoxSizeEnum, BoxTypeEnum } from "src/common/Enums";
import DatesTable from "src/components/DataTable/Index";
import ConfirmDialog from "src/components/ConfirmDialog/Index";
import { RouterUrls } from "src/common/RouterUrls";
import { getImageSrc } from "src/common/getImageSrc";

export default function UpdateProduct() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { data: categories, loading: categoriesLoading } = useApiCall(
        () => productService.getCategories(),
        []
    );
    const { data: types, loading: typesLoading } = useApiCall(
        () => productService.getTypes(),
        []
    );
    const { data: sizes, loading: sizesLoading } = useApiCall(
        () => productService.getSizes(),
        []
    );

    const { data: allDates, loading: allDatesLoading } = useApiCall(
        () => productService.getAllDates(),
        []
    );

    const [totalPrice, setTotalPrice] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingCategoryChange, setPendingCategoryChange] = useState<number | undefined>(undefined);
    const [selectedDateId, setSelectedDateId] = useState<number | undefined>(undefined);
    const [selectedWeight, setSelectedWeight] = useState<number>(0);
    const [weightPrice, setWeightPrice] = useState<number>(0);

    const handleConfirmChange = async () => {
        setConfirmOpen(false);

        if (pendingCategoryChange !== undefined) {
            // Apply the category change
            setForm((prev) => ({
                ...prev,
                categoryId: pendingCategoryChange,
                sizeId: undefined,
                typeId: undefined,
                dates: [],
                fromPrice: 0
            }));

            clearPriceAndDates();
            setPendingCategoryChange(undefined);
        }
    };

    const handleCancelChange = () => {
        setConfirmOpen(false);
        setPendingCategoryChange(undefined);
    };

    const [form, setForm] = useState<Product>({
        id: 0,
        categoryId: undefined,
        typeId: undefined,
        sizeId: undefined,
        nameEn: "",
        nameSv: "",
        descriptionEn: "",
        descriptionSv: "",
        fromPrice: 0,
        isActive: true,
        imageUrl: "",
        dates: []
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

    // Load existing product data
    const loadProduct = async () => {
        if (!id) {
            setErrors(["Product ID is required"]);
            setLoadingProduct(false);
            return;
        }

        try {
            setLoadingProduct(true);
            const response = await productService.getProductById(id);
            const product = response.data;

            setForm({
                id: product.id,
                categoryId: product.categoryId,
                typeId: product.typeId,
                sizeId: product.sizeId,
                nameEn: product.nameEn || "",
                nameSv: product.nameSv || "",
                descriptionEn: product.descriptionEn || "",
                descriptionSv: product.descriptionSv || "",
                fromPrice: product.fromPrice || 0,
                isActive: product.isActive,
                imageUrl: product.imageUrl || "",
                dates: product.dates || []
            });

            // Set preview to existing image if available
            if (product.imageUrl) {
                setPreview(product.imageUrl);
            }

            // If this is a Classic Date Pouch, set the selected date and weight
            if (product.categoryId === BoxCategoryEnum.ClassicDatePouches && product.dates?.length > 0) {
                const firstDate = product.dates[0];
                setSelectedDateId(firstDate.dateId);
                setSelectedWeight(firstDate.quantity);
                setWeightPrice(product.fromPrice || 0);
            }

            // Clear the selected file when loading fresh data
            setImage(null);
        } catch (error: any) {
            console.error("Error loading product:", error);
            setErrors([error.message || 'Failed to load product']);
        } finally {
            setLoadingProduct(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [id]);

    const handleDateSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateId = e.target.value ? parseInt(e.target.value, 10) : undefined;
        setSelectedDateId(dateId);

        // Reset weight and price when date changes
        setSelectedWeight(0);
        setWeightPrice(0);
        setForm((prev) => ({
            ...prev,
            fromPrice: 0
        }));

        // Clear errors
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const weight = e.target.value ? parseInt(e.target.value, 10) : 0;
        setSelectedWeight(weight);

        if (weight > 0 && selectedDateId) {
            // Get the weightPrice from the selected date
            const selectedDate = allDates?.data?.find(d => d.id === selectedDateId);
            const pricePerGram = selectedDate?.weightPrice || 0;
            const calculatedPrice = weight * pricePerGram;
            setWeightPrice(calculatedPrice);

            // Update form price
            setForm((prev) => ({
                ...prev,
                fromPrice: calculatedPrice,
                dates: [{ prdId: prev.id, dateId: selectedDateId, quantity: weight, isFilled: prev.typeId === BoxTypeEnum.FilledDate, isPerWeight: true }]
            }));
        } else {
            setWeightPrice(0);
            setForm((prev) => ({
                ...prev,
                fromPrice: 0
            }));
        }

        // Clear errors
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const clearPriceAndDates = () => {
        setTotalPrice(0);
        setSelectedDateId(undefined);
        setSelectedWeight(0);
        setWeightPrice(0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // Special handling for category change to DateSweetners
        if (name === "categoryId" && value !== "" && Number(value) === BoxCategoryEnum.DateSweetners) {
            setPendingCategoryChange(Number(value));
            setConfirmOpen(true);
            return;
        }

        setForm((prev) => {
            let newValue: any;

            if (type === "checkbox") {
                newValue = checked;
            } else if (name === "fromPrice") {
                const cleaned = value.replace(/^0+(?=\d)/, "");
                newValue = cleaned;
            } else if (name.toLowerCase().includes("id")) {
                newValue = value === "" ? undefined : Number(value);
            } else {
                newValue = value;
            }

            const updatedForm = {
                ...prev,
                [name]: newValue,
            };

            if (name === "categoryId") {
                updatedForm.sizeId = undefined;
                updatedForm.typeId = undefined;
                updatedForm.fromPrice = 0;
                clearPriceAndDates();
            }

            if (name === "typeId" && value !== "") {
                const newTypeId = Number(value);
                let newIsFilled = false;

                if (newTypeId === BoxTypeEnum.PlainDate) newIsFilled = false;
                else if (newTypeId === BoxTypeEnum.FilledDate) newIsFilled = true;
                else if (newTypeId === BoxTypeEnum.AssortedDate) newIsFilled = false;

                updatedForm.dates = prev.dates.map(date => ({
                    ...date,
                    isFilled: newIsFilled,
                    quantity: 0
                }));
                updatedForm.fromPrice = 0;
                clearPriceAndDates();
            }

            if (name === "sizeId" && value !== "") {
                updatedForm.typeId = undefined;

                if (prev.categoryId === BoxCategoryEnum.DateSweetners) {
                    updatedForm.typeId = BoxTypeEnum.None;
                }
                updatedForm.fromPrice = 0;
                clearPriceAndDates();
            }

            return updatedForm;
        });

        // Clear errors when user starts typing/selecting
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            isActive: e.target.checked,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            // Check file size (1MB = 1024 * 1024 bytes)
            const maxSize = 1024 * 1024; // 1MB in bytes
            if (file.size > maxSize) {
                setErrors([`Image size must be less than 1MB. Selected file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`]);
                // Clear the file input
                e.target.value = '';
                setImage(null);
                // Reset to original image
                setPreview(form.imageUrl || null);

                // Scroll to error box
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
            // Reset to original image if no new file selected
            setPreview(form.imageUrl || null);
        }

        // Clear errors when user selects a valid file
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    // Handle editor content changes
    const handleEditorChange = (field: string, content: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: content,
        }));

        // Clear errors when user starts typing in editor
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    // Handle date selection changes
    const handleDatesChange = (updatedDates: DatesProduct[]) => {
        // Calculate price directly here
        const calculatedPrice = updatedDates.reduce((sum, item) => {
            const dateInfo = allDates?.data?.find((d) => d.id === item.dateId);
            return sum + item.quantity * (dateInfo?.unitPrice || 0);
        }, 0);

        setTotalPrice(calculatedPrice);

        setForm((prev) => ({
            ...prev,
            dates: updatedDates,
            // Update fromPrice with calculatedPrice when dates change (but not for DateSweetners)
            fromPrice: prev.categoryId !== BoxCategoryEnum.DateSweetners ? calculatedPrice : prev.fromPrice
        }));
    };

    const validateForm = () => {
        const validationErrors: string[] = [];

        if (!form.nameEn.trim()) {
            validationErrors.push("English name is required");
        }
        if (!form.nameSv.trim()) {
            validationErrors.push("Swedish name is required");
        }
        if (!form.categoryId) {
            validationErrors.push("Category is required");
        }
        if (!form.typeId) {
            validationErrors.push("Type is required");
        }
        if (!form.sizeId) {
            validationErrors.push("Size is required");
        }
        if (!image && !form.imageUrl) {
            validationErrors.push("Image is required");
        }

        // Add validation for Classic Date Pouches
        if (form.categoryId === BoxCategoryEnum.ClassicDatePouches) {
            if (!selectedDateId) {
                validationErrors.push("Date selection is required for Classic Date Pouches");
            }
            if (!selectedWeight || selectedWeight <= 0) {
                validationErrors.push("Quantity (grams) must be greater than 0 for Classic Date Pouches");
            }
        }

        setErrors(validationErrors);

        // Scroll to error box if there are validation errors
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        if (!validateForm()) return;

        setLoading(true);

        try {
            const productData = {
                id: form.id,
                categoryId: form.categoryId,
                typeId: form.typeId,
                sizeId: form.sizeId,
                nameEn: form.nameEn,
                nameSv: form.nameSv,
                descriptionEn: form.descriptionEn,
                descriptionSv: form.descriptionSv,
                fromPrice: form.fromPrice,
                isActive: form.isActive,
                dates: form.dates.map(d => ({
                    ...d,
                    isPerWeight: form.categoryId === Number(BoxCategoryEnum.ClassicDatePouches) ? true : d.isPerWeight
                })),
                imageFile: image
            };

            await productService.updateProduct(productData);

            await loadProduct().then(() => {
                notifySuccess();
            });

        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to update Box']);
        } finally {
            setLoading(false);
        }
    };

    const notifySuccess = () => {
        toast.success('Box updated successfully!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
    };

    const getFilteredSizes = () => {
        if (!form.categoryId || !sizes?.data) return [];

        return sizes.data.filter(size => {
            switch (form.categoryId) {
                case BoxCategoryEnum.SignatureDateGifts:
                    return [
                        BoxSizeEnum.Pieces8,
                        BoxSizeEnum.Pieces9,
                        BoxSizeEnum.Pieces12,
                        BoxSizeEnum.Pieces20,
                        BoxSizeEnum.Pieces35
                    ].includes(size.id);

                case BoxCategoryEnum.SignatureDates:
                    return [
                        BoxSizeEnum.Grams250,
                        BoxSizeEnum.Grams500
                    ].includes(size.id);

                case BoxCategoryEnum.SignatureFilledDates:
                    return [
                        BoxSizeEnum.Grams250,
                        BoxSizeEnum.Grams500
                    ].includes(size.id);

                case BoxCategoryEnum.ClassicDatePouches:
                    return size.id === BoxSizeEnum.Grams400;

                case BoxCategoryEnum.DateSnacks:
                    return [
                        BoxSizeEnum.Piece1,
                        BoxSizeEnum.Pieces3
                    ].includes(size.id);

                case BoxCategoryEnum.DateSweetners:
                    return [
                        BoxSizeEnum.Milliliters400,
                        BoxSizeEnum.Grams450
                    ].includes(size.id);

                default:
                    return true;
            }
        });
    };

    const getFilteredTypes = () => {
        if (!form.categoryId || !types?.data) return [];

        return types.data.filter(type => {
            switch (form.categoryId) {

                case BoxCategoryEnum.ClassicDatePouches:
                    return [
                        BoxTypeEnum.PlainDate,
                        BoxTypeEnum.FilledDate
                    ].includes(type.id);

                case BoxCategoryEnum.DateSweetners:
                    return type.id === BoxTypeEnum.PlainDate;

                default:
                    return true;
            }
        });
    };

    if (loadingProduct) {
        return (
            <>
                <Helmet>
                    <title>Update Box - Application</title>
                </Helmet>
                <PageTitleWrapper>
                    <PageTitle
                        heading="Update Box"
                        subHeading="Loading Box details..."
                        backUrl={RouterUrls.boxesList}
                    />
                </PageTitleWrapper>
                <Container maxWidth="lg">
                    <Backdrop open={loadingProduct} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </Container>
                <Footer />
            </>
        );
    }

    return (
        <>
            <PortalToastContainer />
            <Helmet>
                <title>Update Box - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Update Box"
                    subHeading="Update existing Box set information"
                    backUrl="/boxes"
                />
            </PageTitleWrapper>
            <Container maxWidth="lg">
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
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="stretch"
                        spacing={3}
                    >
                        <Grid item xs={12}>
                            <Card>
                                <CardHeader title="Box Details" />
                                <Divider />
                                <CardContent>
                                    <Box sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                                        <TextField
                                            required
                                            name="nameEn"
                                            label="English Name"
                                            value={form.nameEn}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                        <Box sx={{ m: 1 }}>
                                            <Editor
                                                label="English Description"
                                                value={form.descriptionEn}
                                                onChange={(content) => handleEditorChange('descriptionEn', content)}
                                            />
                                        </Box>
                                        <TextField
                                            required
                                            name="nameSv"
                                            label="Swedish Name"
                                            value={form.nameSv}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                        <Box sx={{ m: 1 }}>
                                            <Editor
                                                label="Swedish Description"
                                                value={form.descriptionSv}
                                                onChange={(content) => handleEditorChange('descriptionSv', content)}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardHeader title="Box Categories" />
                                <Divider />
                                <CardContent>
                                    <Box sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                                        <TextField
                                            required
                                            name="categoryId"
                                            select
                                            value={form.categoryId || ''}
                                            onChange={handleChange}
                                            SelectProps={{ native: true }}
                                            variant="standard"
                                            disabled={categoriesLoading}
                                        >
                                            <option value="">Select Category</option>
                                            {categories?.data?.map((option) => (
                                                <option key={option.id} value={option.id}>
                                                    {option.nameEn}
                                                </option>
                                            ))}
                                        </TextField>

                                        <TextField
                                            required
                                            name="sizeId"
                                            select
                                            value={form.sizeId || ''}
                                            onChange={handleChange}
                                            SelectProps={{ native: true }}
                                            variant="standard"
                                            disabled={sizesLoading || !form.categoryId}
                                        >
                                            <option value="">Select Size</option>
                                            {getFilteredSizes().map(option => (
                                                <option key={option.id} value={option.id}>
                                                    {option.nameEn}
                                                </option>
                                            ))}
                                        </TextField>

                                        {form.categoryId !== BoxCategoryEnum.DateSweetners && (
                                            <TextField
                                                required
                                                name="typeId"
                                                select
                                                value={form.typeId || ''}
                                                onChange={handleChange}
                                                SelectProps={{ native: true }}
                                                variant="standard"
                                                disabled={typesLoading || !form.categoryId}
                                            >
                                                <option value="">Select Type</option>
                                                {getFilteredTypes().map(option => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.nameEn}
                                                    </option>
                                                ))}
                                            </TextField>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {![BoxCategoryEnum.DateSweetners].includes(form.categoryId) && form.typeId && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader title="Dates" />
                                    <Divider />
                                    <CardContent>
                                        {form.categoryId === BoxCategoryEnum.ClassicDatePouches ? (
                                            // Date and weight selector for Classic Date Pouches
                                            <Box>
                                                <TextField
                                                    required
                                                    name="dateId"
                                                    label="Select Date"
                                                    select
                                                    value={selectedDateId || ''}
                                                    onChange={handleDateSelectionChange}
                                                    SelectProps={{ native: true }}
                                                    variant="standard"
                                                    fullWidth
                                                    sx={{ mb: 2 }}
                                                    disabled={allDatesLoading}
                                                    error={errors.some(e => e.includes('Date selection'))}
                                                >
                                                    <option value="">Select Date</option>
                                                    {allDates?.data?.map((date) => (
                                                        <option key={date.id} value={date.id}>
                                                            {date.nameEn}
                                                        </option>
                                                    ))}
                                                </TextField>

                                                {selectedDateId && (
                                                    <TextField
                                                        required
                                                        name="weight"
                                                        label="Quantity (grams)"
                                                        type="number"
                                                        value={selectedWeight || ''}
                                                        onChange={handleWeightChange}
                                                        variant="standard"
                                                        fullWidth
                                                        inputProps={{ min: 1 }}
                                                        sx={{
                                                            mb: 2,
                                                            '& input[type=number]': {
                                                                '-moz-appearance': 'textfield',
                                                            },
                                                            '& input[type=number]::-webkit-outer-spin-button': {
                                                                '-webkit-appearance': 'none',
                                                                margin: 0,
                                                            },
                                                            '& input[type=number]::-webkit-inner-spin-button': {
                                                                '-webkit-appearance': 'none',
                                                                margin: 0,
                                                            },
                                                        }}
                                                        error={errors.some(e => e.includes('Weight must be greater'))}
                                                    />
                                                )}

                                                {selectedWeight > 0 && selectedDateId && (
                                                    <Box
                                                        sx={{
                                                            mt: 2,
                                                            p: 2,
                                                            bgcolor: 'action.hover',
                                                            borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <strong>Selected Date:</strong>
                                                            <span>{allDates?.data?.find(d => d.id === selectedDateId)?.nameEn}</span>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <strong>Quantity:</strong>
                                                            <span>{selectedWeight}g</span>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <strong>Price per Gram:</strong>
                                                            <span>${(allDates?.data?.find(d => d.id === selectedDateId)?.weightPrice || 0).toFixed(2)}</span>
                                                        </Box>
                                                        <Divider sx={{ my: 1 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <strong style={{ fontSize: '1.1rem' }}>Total Price:</strong>
                                                            <strong style={{ fontSize: '1.1rem' }}>${weightPrice.toFixed(2)}</strong>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        ) : form.categoryId !== BoxCategoryEnum.ClassicDatePouches ? (
                                            // Regular dates table for other categories
                                            <DatesTable
                                                dates={allDates?.data || []}
                                                value={form.dates}
                                                onChange={handleDatesChange}
                                                loading={allDatesLoading}
                                                productId={form.id}
                                                typeId={form.typeId}
                                            />
                                        ) : null}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {form.typeId && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader title="Price" />
                                    <Divider />
                                    <CardContent>
                                        <TextField
                                            name="fromPrice"
                                            label="Total Price"
                                            type="number"
                                            value={form.fromPrice || 0}
                                            onChange={handleChange}
                                            InputProps={{
                                                readOnly: form.categoryId !== BoxCategoryEnum.DateSweetners,
                                            }}
                                            variant="standard"
                                            fullWidth
                                            sx={{
                                                '& input[type=number]': {
                                                    '-moz-appearance': 'textfield',
                                                },
                                                '& input[type=number]::-webkit-outer-spin-button': {
                                                    '-webkit-appearance': 'none',
                                                    margin: 0,
                                                },
                                                '& input[type=number]::-webkit-inner-spin-button': {
                                                    '-webkit-appearance': 'none',
                                                    margin: 0,
                                                },
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Card>
                                <CardHeader title="Image Upload" />
                                <Divider />
                                <CardContent>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ marginBottom: '1rem' }}
                                        required
                                    />
                                    {!preview && <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 1 }}>
                                        * Image is required (max size: 1MB)
                                    </Box>}
                                    {preview && (
                                        <Box sx={{ mt: 2 }}>
                                            <img
                                                src={getImageSrc(preview)}
                                                alt="Preview"
                                                style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain' }}
                                            />
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardHeader title="Status" />
                                <Divider />
                                <CardContent>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.isActive}
                                                onChange={handleSwitchChange}
                                                name="isActive"
                                            />
                                        }
                                        label=""
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Submit Button */}
                    <Box textAlign='center' m={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            size="large"
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => navigate(RouterUrls.boxesList)}
                            size="large"
                            sx={{ ml: 2 }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Container>
            <ConfirmDialog
                open={confirmOpen}
                onClose={handleCancelChange}
                onConfirm={handleConfirmChange}
                title="Change Category"
                message={`Are you sure you want to change the category of this Box? Your about to remove all selected dates and reset the price. This action cannot be undone.`}
                confirmText="Change"
                cancelText="Cancel"
                confirmVariant="danger"
            />
        </>
    );
}