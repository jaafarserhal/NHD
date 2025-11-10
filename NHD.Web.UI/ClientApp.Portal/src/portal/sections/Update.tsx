import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField, Backdrop, CircularProgress } from "@mui/material";
import { Section } from "../models/Types";
import sectionsService from '../../api/sectionService';
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
import { useApiCall } from "src/api/hooks/useApi";

export default function UpdateSection() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState<Section>({
        id: 0,
        titleEn: "",
        titleSv: "",
        descriptionEn: "",
        descriptionSv: "",
        ImageFile: "",
        isActive: true,
        typeId: 0,
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingSection, setLoadingSection] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

    const { data: types, loading: typesLoading } = useApiCall(
        () => sectionsService.getTypes(),
        []
    );

    // Load existing section data
    const loadSection = async () => {
        if (!id) {
            setErrors(["Section ID is required"]);
            setLoadingSection(false);
            return;
        }

        try {
            setLoadingSection(true);
            const response = await sectionsService.getSectionById(id);
            const section = response.data;

            setForm({
                id: section.id,
                titleEn: section.titleEn || "",
                titleSv: section.titleSv || "",
                descriptionEn: section.descriptionEn || "",
                descriptionSv: section.descriptionSv || "",
                ImageFile: section.imageUrl || "",
                isActive: section.isActive,
                typeId: section.typeId || 0,
            });

            // Set preview to existing image if available
            if (section.imageUrl) {
                setPreview(section.imageUrl);
            }

            // Clear the selected file when loading fresh data
            setImage(null);
        } catch (error: any) {
            console.error("Error loading section:", error);
            setErrors([error.message || 'Failed to load section']);
        } finally {
            setLoadingSection(false);
        }
    };

    useEffect(() => {
        loadSection();
    }, [id]);



    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            isActive: e.target.checked,
        }));
    };

    const handleHomeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            isHomeSlider: e.target.checked,
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
                setPreview(form.ImageFile || null);

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
            setPreview(form.ImageFile || null);
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

        if (!form.titleEn.trim()) {
            validationErrors.push("English title is required");
        }
        if (!form.titleSv.trim()) {
            validationErrors.push("Swedish title is required");
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
            const sectionData = {
                id: form.id,
                titleEn: form.titleEn,
                titleSv: form.titleSv,
                descriptionEn: form.descriptionEn,
                descriptionSv: form.descriptionSv,
                isActive: form.isActive,
                imageFile: image,
                typeId: form.typeId,
            };

            await sectionsService.updateSection(sectionData);

            await loadSection().then(() => {
                notifySuccess();
            });

        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to update Section']);
        } finally {
            setLoading(false);
        }
    };

    const notifySuccess = () => {
        toast.success('Section updated successfully!', {
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

    if (loadingSection) {
        return (
            <>
                <Helmet>
                    <title>Update Section - Application</title>
                </Helmet>
                <PageTitleWrapper>
                    <PageTitle
                        heading="Update Section"
                        subHeading="Loading Section details..."
                        backUrl={RouterUrls.productsList}
                    />
                </PageTitleWrapper>
                <Container maxWidth="lg">
                    <Backdrop open={loadingSection} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
                <title>Update Section - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Update Section"
                    subHeading="Update existing Section information"
                    backUrl={RouterUrls.sectionsList}
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
                                            name="titleEn"
                                            label="English Title"
                                            value={form.titleEn}
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
                                            name="titleSv"
                                            label="Swedish Title"
                                            value={form.titleSv}
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
                                    />
                                    {!preview && <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 1 }}>
                                        * (max size: 1MB)
                                    </Box>}
                                    {preview && (
                                        <Box sx={{ mt: 2 }}>
                                            <img
                                                src={getImageSrc(preview, 'sections')}
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
                                <CardHeader title="Section Type" />
                                <Divider />
                                <CardContent>
                                    <TextField
                                        required
                                        name="typeId"
                                        select
                                        value={form.typeId || ''}
                                        onChange={handleChange}
                                        SelectProps={{ native: true }}
                                        variant="standard"
                                        disabled={typesLoading}
                                    >
                                        <option value="">Select Type</option>
                                        {types?.data?.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.nameEn}
                                            </option>
                                        ))}
                                    </TextField>
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
                            onClick={() => navigate(RouterUrls.sectionsList)}
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