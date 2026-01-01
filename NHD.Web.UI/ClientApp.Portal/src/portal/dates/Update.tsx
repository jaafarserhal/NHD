import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField, Backdrop, CircularProgress } from "@mui/material";
import { Date } from "../models/Types";
import dateService from '../../api/dateService';
import { Helmet } from "react-helmet-async";
import Footer from "src/components/Footer";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import { useApiCall } from '../../api/hooks/useApi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { RouterUrls } from "src/common/RouterUrls";
import { validateFileSize } from "src/common/fileValidation";
import { getImageSrc } from "src/common/Utils";
import Editor from "src/components/Editor/Index";

export default function UpdateDate() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState<Date>({
        id: 0,
        nameEn: "",
        nameSv: "",
        quality: false,
        unitPrice: undefined,
        weightPrice: undefined,
        isFilled: false,
        descriptionEn: "",
        descriptionSv: "",
        imageUrl: "",
        isActive: true
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingDate, setLoadingDate] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

    // Load existing date data
    const loadDate = async () => {
        if (!id) {
            setErrors(["Date ID is required"]);
            setLoadingDate(false);
            return;
        }

        try {
            setLoadingDate(true);
            const response = await dateService.getDateById(id);
            const date = response.data;

            setForm({
                id: date.id,
                nameEn: date.nameEn,
                nameSv: date.nameSv,
                quality: date.quality,
                unitPrice: date.unitPrice,
                weightPrice: date.weightPrice,
                descriptionEn: date.descriptionEn,
                descriptionSv: date.descriptionSv,
                isFilled: date.isFilled,
                imageUrl: date.imageUrl,
                isActive: date.isActive
            });
            // Set preview to existing image if available
            if (date.imageUrl) {
                setPreview(date.imageUrl);
            }

            // Clear the selected file when loading fresh data
            setImage(null);

        } catch (error: any) {
            console.error("Error loading date:", error);
            setErrors([error.message || 'Failed to load date']);
        } finally {
            setLoadingDate(false);
        }
    };

    useEffect(() => {
        loadDate();
    }, [id]);

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
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "unitPrice" || name === "weightPrice"
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
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            const validation = validateFileSize(file, 2); // 2MB limit

            if (!validation.isValid) {
                setErrors([validation.error!]);
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
    const handleActiveSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            isActive: e.target.checked,
        }));
    };

    const handleQualitySwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            quality: e.target.checked,
        }));
    };

    const handleIsFilledSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            isFilled: e.target.checked,
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
        if (form.unitPrice === undefined || form.unitPrice <= 0) {
            validationErrors.push("Valid unit price is required");
        }
        if (form.weightPrice === undefined || form.weightPrice <= 0) {
            validationErrors.push("Valid weight price is required");
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
            const datesData = {
                id: form.id,
                nameEn: form.nameEn,
                nameSv: form.nameSv,
                quality: form.quality,
                unitPrice: form.unitPrice,
                weightPrice: form.weightPrice,
                descriptionEn: form.descriptionEn,
                descriptionSv: form.descriptionSv,
                isFilled: form.isFilled,
                isActive: form.isActive,
                imageFile: image
            };

            await dateService.updateDate(datesData);

            notifySuccess();
        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to update date']);
        } finally {
            setLoading(false);
        }
    };

    const notifySuccess = () => {
        toast.success('Date updated successfully!', {
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

    if (loadingDate) {
        return (
            <>
                <Helmet>
                    <title>Update Date - Application</title>
                </Helmet>
                <PageTitleWrapper>
                    <PageTitle
                        heading="Update Date"
                        subHeading="Loading date details..."
                        backUrl="/dates"
                    />
                </PageTitleWrapper>
                <Container maxWidth="lg">
                    <Backdrop open={loadingDate} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
                <title>Update Date - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Update Date"
                    subHeading="Update existing date information"
                    backUrl={RouterUrls.datesList}
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
                                            label="Name (English)"
                                            value={form.nameEn}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                        <Box sx={{ m: 1 }}>
                                            <Editor
                                                label="Description (English)"
                                                value={form.descriptionEn}
                                                onChange={(content) => handleEditorChange('descriptionEn', content)}
                                            />
                                        </Box>
                                        <TextField
                                            required
                                            name="nameSv"
                                            label="Name (Swedish)"
                                            value={form.nameSv}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />

                                        <Box sx={{ m: 1 }}>
                                            <Editor
                                                label="Description (Swedish)"
                                                value={form.descriptionSv}
                                                onChange={(content) => handleEditorChange('descriptionSv', content)}
                                            />
                                        </Box>

                                        <TextField
                                            name="unitPrice"
                                            label="Price / piece"
                                            type="number"
                                            value={form.unitPrice || ''}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                            required
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

                                        <TextField
                                            name="weightPrice"
                                            label="Price / gram"
                                            type="number"
                                            value={form.weightPrice || ''}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                            required
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
                                <CardHeader title="Banner" />
                                <Divider />
                                <CardContent>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.quality}
                                                onChange={handleQualitySwitchChange}
                                                name="quality"
                                            />
                                        }
                                        label=''
                                    />
                                </CardContent>
                            </Card>
                        </Grid>


                        <Grid item xs={12}>
                            <Card>
                                <CardHeader
                                    title={
                                        <>
                                            Image Upload
                                        </>
                                    }
                                />
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
                                        * Image is required (max size: 2MB) <span style={{ color: "red" }}>{form.quality ? "192 x 148" : "500 x 625"}</span>
                                    </Box>}
                                    {preview && (
                                        <Box sx={{ mt: 2 }}>
                                            <img
                                                src={getImageSrc(preview, 'dates')}
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
                                <CardHeader title="Filled" />
                                <Divider />
                                <CardContent>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.isFilled}
                                                onChange={handleIsFilledSwitchChange}
                                                name="isFilled"
                                            />
                                        }
                                        label=''
                                    />
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
                                                onChange={handleActiveSwitchChange}
                                                name="isActive"
                                            />
                                        }
                                        label="Active"
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
                            onClick={() => navigate(RouterUrls.datesList)}
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