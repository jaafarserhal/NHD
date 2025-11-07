import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField, Backdrop, CircularProgress } from "@mui/material";
import { Product, DatesProduct, DatesCollection } from "../models/Types";
import dateService from '../../api/dateService';
import { Helmet } from "react-helmet-async";
import Footer from "src/components/Footer";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import Editor from "src/components/Editor/Index";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { RouterUrls } from "src/common/RouterUrls";
import { getImageSrc } from "src/common/getImageSrc";

export default function UpdateCollection() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState<DatesCollection>({
        id: 0,
        nameEn: "",
        nameSv: "",
        descriptionEn: "",
        descriptionSv: "",
        imageUrl: "",
        isActive: true
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingCollection, setLoadingCollection] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

    // Load existing collection data
    const loadCollection = async () => {
        if (!id) {
            setErrors(["Collection ID is required"]);
            setLoadingCollection(false);
            return;
        }

        try {
            setLoadingCollection(true);
            const response = await dateService.getCollectionById(id);
            const collection = response.data;

            setForm({
                id: collection.id,
                nameEn: collection.nameEn || "",
                nameSv: collection.nameSv || "",
                descriptionEn: collection.descriptionEn || "",
                descriptionSv: collection.descriptionSv || "",
                imageUrl: collection.imageUrl || "",
                isActive: collection.isActive,
            });

            // Set preview to existing image if available
            if (collection.imageUrl) {
                setPreview(collection.imageUrl);
            }

            // Clear the selected file when loading fresh data
            setImage(null);
        } catch (error: any) {
            console.error("Error loading product:", error);
            setErrors([error.message || 'Failed to load collection']);
        } finally {
            setLoadingCollection(false);
        }
    };

    useEffect(() => {
        loadCollection();
    }, [id]);



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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear validation errors when the user types
        if (errors.length) setErrors([]);
    };



    const validateForm = () => {
        const validationErrors: string[] = [];

        if (!form.nameEn.trim()) {
            validationErrors.push("English name is required");
        }
        if (!form.nameSv.trim()) {
            validationErrors.push("Swedish name is required");
        }

        if (!image && !form.imageUrl) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        if (!validateForm()) return;

        setLoading(true);

        try {
            const collectionData = {
                id: form.id,
                nameEn: form.nameEn,
                nameSv: form.nameSv,
                descriptionEn: form.descriptionEn,
                descriptionSv: form.descriptionSv,
                isActive: form.isActive,
                imageFile: image
            };

            await dateService.updateCollection(collectionData);

            await loadCollection().then(() => {
                notifySuccess();
            });

        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to update collection.']);
        } finally {
            setLoading(false);
        }
    };

    const notifySuccess = () => {
        toast.success('Collection updated successfully!', {
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

    if (loadingCollection) {
        return (
            <>
                <Helmet>
                    <title>Update Collection - Application</title>
                </Helmet>
                <PageTitleWrapper>
                    <PageTitle
                        heading="Update Collection"
                        subHeading="Loading Collection details..."
                        backUrl={RouterUrls.productsList}
                    />
                </PageTitleWrapper>
                <Container maxWidth="lg">
                    <Backdrop open={loadingCollection} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
                <title>Update Collection - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Update Collection"
                    subHeading="Update existing Collection information"
                    backUrl={RouterUrls.collectionsList}
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
                                <CardHeader title="Details" />
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
                                                src={getImageSrc(preview, 'collections')}
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
                            onClick={() => navigate(RouterUrls.collectionsList)}
                            size="large"
                            sx={{ ml: 2 }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Container>
        </>
    );
}