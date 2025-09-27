import React, { useState } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField } from "@mui/material";
import { Product } from "../models/Types";
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import { Helmet } from "react-helmet-async";
import Footer from "src/components/Footer";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import Editor from "src/components/Editor/Index";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { SetCategoryEnum, SetSizeEnum, SetTypeEnum } from "src/common/Enums";

export default function AddProduct() {

    const navigate = useNavigate();
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

    const [form, setForm] = useState<Omit<Product, "id" | "imageUrl">>({
        categoryId: undefined,
        typeId: undefined,
        sizeId: undefined,
        nameEn: "",
        nameSv: "",
        descriptionEn: "",
        descriptionSv: "",
        fromPrice: 0,
        isActive: true,
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "fromPrice"
                        ? (value === "" ? 0 : parseFloat(value)) // ✅ convert to number
                        : name.toLowerCase().includes("id")
                            ? (value === "" ? undefined : Number(value))
                            : value,
        }));

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
                setPreview(null);

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
            setPreview(null);
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
        if (!image) {
            validationErrors.push("Image is required");
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

    // handleSubmit in your component
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (!image) throw new Error("Please select an image.");

            const productData = { ...form, imageFile: image };

            await productService.addProduct(productData);

            notifySuccess();

            // Reset form
            setForm({
                categoryId: undefined,
                typeId: undefined,
                sizeId: undefined,
                nameEn: "",
                nameSv: "",
                descriptionEn: "",
                descriptionSv: "",
                fromPrice: 0,
                isActive: true,
            });
            setImage(null);
            setPreview(null);

            // Clear file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to add product']);
        } finally {
            setLoading(false);
        }
    };

    const label = { inputProps: { 'aria-label': 'Switch demo' } };
    const notifySuccess = () => {
        toast.success('Date Set added successfully!', {
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

    return (
        <>
            <PortalToastContainer />
            <Helmet>
                <title>Add Box - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Add Box"
                    subHeading="Add a new box to your catalog"
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
                                        <TextField
                                            name="fromPrice"
                                            label="From Price"
                                            type="number"
                                            value={form.fromPrice || ''}
                                            onChange={handleChange}
                                            variant="standard"
                                            inputProps={{ min: 0, step: 0.01 }}
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
                                            {sizes?.data
                                                ?.filter(size => {
                                                    if (form.categoryId === SetCategoryEnum.DateSweetners) {
                                                        return (
                                                            size.id === SetSizeEnum.Milliliters400 ||
                                                            size.id === SetSizeEnum.Grams450
                                                        );
                                                    } else {
                                                        return (
                                                            size.id != SetSizeEnum.Milliliters400 &&
                                                            size.id != SetSizeEnum.Grams450
                                                        );
                                                    }
                                                })
                                                .map(option => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.nameEn}
                                                    </option>
                                                ))}
                                        </TextField>

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
                                            {types?.data
                                                ?.filter(type => {
                                                    if (form.categoryId === SetCategoryEnum.DateSweetners) {
                                                        return (
                                                            type.id === SetTypeEnum.PlainDate
                                                        );
                                                    } else {
                                                        return (
                                                            type.id != SetTypeEnum.PlainDate
                                                        );
                                                    }
                                                })
                                                .map(option => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.nameEn}
                                                    </option>
                                                ))}
                                        </TextField>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

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
                                                src={preview}
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
                                        label=''
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
                            onClick={() => navigate('/boxes')}
                            size="large"
                            sx={{ ml: 2 }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Container>
            <Footer />
        </>
    );
}