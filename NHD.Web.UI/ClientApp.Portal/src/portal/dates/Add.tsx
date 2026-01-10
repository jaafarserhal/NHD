import React, { useState } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField, IconButton, Typography } from "@mui/material";
import { Date } from "../models/Types";
import dateService from '../../api/dateService';
import { Helmet } from "react-helmet-async";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import { useNavigate } from 'react-router-dom';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { RouterUrls } from "src/common/RouterUrls";
import { validateFileSize } from "src/common/fileValidation";
import Editor from "src/components/Editor/Index";
import { DeleteIcon } from "lucide-react";
import AddIcon from '@mui/icons-material/Add';

export default function AddDate() {

    const navigate = useNavigate();


    const [form, setForm] = useState<Omit<Date, "id" | "imageUrl" | "bannerImageUrl">>({
        nameEn: "",
        nameSv: "",
        quality: false,
        unitPrice: undefined,
        weightPrice: undefined,
        descriptionEn: "",
        descriptionSv: "",
        isFilled: false,
        isActive: true,
        additionalInfos: []
    });

    const [image, setImage] = useState<File | null>(null);
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

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
            setPreview(null);
        }

        // Clear errors when user selects a valid file
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            const validation = validateFileSize(file, 2); // 2MB limit

            if (!validation.isValid) {
                setErrors([validation.error!]);
                // Clear the file input
                e.target.value = '';
                setBannerImage(null);
                setBannerPreview(null);

                // Scroll to error box
                setTimeout(() => {
                    errorBoxRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
                return;
            }

            setBannerImage(file);
            setBannerPreview(URL.createObjectURL(file));
        } else {
            setBannerImage(null);
            setBannerPreview(null);
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
    }

    // Additional Info handlers
    const handleAddAdditionalInfo = () => {
        setForm((prev) => ({
            ...prev,
            additionalInfos: [...prev.additionalInfos, { dateId: 0, keyEn: "", keySv: "", valueEn: "", valueSv: "" }]
        }));
    };

    const handleRemoveAdditionalInfo = (index: number) => {
        setForm((prev) => ({
            ...prev,
            additionalInfos: prev.additionalInfos.filter((_, i) => i !== index)
        }));
    };

    const handleAdditionalInfoChange = (index: number, field: 'keyEn' | 'keySv' | 'valueEn' | 'valueSv', value: string) => {
        setForm((prev) => ({
            ...prev,
            additionalInfos: prev.additionalInfos.map((info, i) =>
                i === index ? { ...info, [field]: value } : info
            )
        }));

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
        if (form.unitPrice === undefined || form.unitPrice < 0) {
            validationErrors.push("Valid unit price is required");
        }
        if (form.weightPrice === undefined || form.weightPrice < 0) {
            validationErrors.push("Valid weight price is required");
        }
        if (!image) {
            validationErrors.push("Image is required");
        }

        if (form.additionalInfos.length === 0) {
            validationErrors.push("At least one additional info is required");
        }

        // Validate additional info
        form.additionalInfos.forEach((info, index) => {
            const hasKeyEn = info.keyEn.trim().length > 0;
            const hasKeySv = info.keySv.trim().length > 0;
            const hasValueEn = info.valueEn.trim().length > 0;
            const hasValueSv = info.valueSv.trim().length > 0;

            // Check if the entry is completely empty
            if (!hasKeyEn && !hasKeySv && !hasValueEn && !hasValueSv) {
                validationErrors.push(`Additional info #${index + 1}: All fields are empty`);
                return;
            }

            // If keyEn is provided, keySv must also be provided (and vice versa)
            if (hasKeyEn && !hasKeySv) {
                validationErrors.push(`Additional info #${index + 1}: Swedish key is required when English key is provided`);
            }
            if (!hasKeyEn && hasKeySv) {
                validationErrors.push(`Additional info #${index + 1}: English key is required when Swedish key is provided`);
            }

            // If valueEn is provided, valueSv must also be provided (and vice versa)
            if (hasValueEn && !hasValueSv) {
                validationErrors.push(`Additional info #${index + 1}: Swedish value is required when English value is provided`);
            }
            if (!hasValueEn && hasValueSv) {
                validationErrors.push(`Additional info #${index + 1}: English value is required when Swedish value is provided`);
            }

            // If keys are provided, values must be provided (and vice versa)
            if ((hasKeyEn || hasKeySv) && !hasValueEn && !hasValueSv) {
                validationErrors.push(`Additional info #${index + 1}: Values are required when keys are provided`);
            }
            if ((hasValueEn || hasValueSv) && !hasKeyEn && !hasKeySv) {
                validationErrors.push(`Additional info #${index + 1}: Keys are required when values are provided`);
            }
        });

        // Check for duplicate keys (English)
        const keysEn = form.additionalInfos
            .filter(info => info.keyEn.trim())
            .map(info => info.keyEn.trim().toLowerCase());
        const duplicatesEn = keysEn.filter((key, index) => keysEn.indexOf(key) !== index);
        if (duplicatesEn.length > 0) {
            validationErrors.push(`Duplicate English keys found: ${[...new Set(duplicatesEn)].join(', ')}`);
        }

        // Check for duplicate keys (Swedish)
        const keysSv = form.additionalInfos
            .filter(info => info.keySv.trim())
            .map(info => info.keySv.trim().toLowerCase());
        const duplicatesSv = keysSv.filter((key, index) => keysSv.indexOf(key) !== index);
        if (duplicatesSv.length > 0) {
            validationErrors.push(`Duplicate Swedish keys found: ${[...new Set(duplicatesSv)].join(', ')}`);
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

    // handleSubmit in your component
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (!image) throw new Error("Please select an image.");

            // Filter out empty additional info entries
            const filteredAdditionalInfos = form.additionalInfos.filter(
                info => info.keyEn.trim() && info.valueEn.trim()
            );

            const dateData = {
                ...form,
                additionalInfos: filteredAdditionalInfos,
                imageFile: image,
                bannerImageFile: bannerImage
            };

            await dateService.addDate(dateData);

            navigate(RouterUrls.datesList);

            // Reset form
            setForm({
                nameEn: "",
                nameSv: "",
                quality: false,
                unitPrice: undefined,
                weightPrice: undefined,
                descriptionEn: "",
                descriptionSv: "",
                isFilled: false,
                isActive: true,
                additionalInfos: []
            });

        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to add date']);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <PortalToastContainer />
            <Helmet>
                <title>Add Date - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Add Date"
                    subHeading="Add a new date to your catalog"
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
                        {/* Additional Information */}
                        <Grid item xs={12}>
                            <Card>
                                <CardHeader
                                    title="Additional Information"
                                    action={
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={handleAddAdditionalInfo}
                                            variant="outlined"
                                            size="small"
                                        >
                                            Add Info
                                        </Button>
                                    }
                                />
                                <Divider />
                                <CardContent>
                                    {form.additionalInfos.length === 0 ? (
                                        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                                            No additional information added. Click "Add Info" to add key-value pairs.
                                        </Typography>
                                    ) : (
                                        <Box>
                                            {form.additionalInfos.map((info, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 2,
                                                        mb: 2,
                                                        alignItems: 'flex-start'
                                                    }}
                                                >
                                                    <TextField
                                                        label="Key (English)"
                                                        value={info.keyEn}
                                                        onChange={(e) => handleAdditionalInfoChange(index, 'keyEn', e.target.value)}
                                                        placeholder="e.g., Origin, Weight, etc."
                                                        fullWidth
                                                        size="small"
                                                    />
                                                    <TextField
                                                        label="Value (English)"
                                                        value={info.valueEn}
                                                        onChange={(e) => handleAdditionalInfoChange(index, 'valueEn', e.target.value)}
                                                        placeholder="e.g., Saudi Arabia, 500g, etc."
                                                        fullWidth
                                                        size="small"
                                                    />
                                                    <TextField
                                                        label="Key (Swedish)"
                                                        value={info.keySv}
                                                        onChange={(e) => handleAdditionalInfoChange(index, 'keySv', e.target.value)}
                                                        placeholder="t.ex., Ursprung, Vikt, etc."
                                                        fullWidth
                                                        size="small"
                                                    />
                                                    <TextField
                                                        label="Value (Swedish)"
                                                        value={info.valueSv}
                                                        onChange={(e) => handleAdditionalInfoChange(index, 'valueSv', e.target.value)}
                                                        placeholder="t.ex., Saudiarabien, 500g, etc."
                                                        fullWidth
                                                        size="small"
                                                    />
                                                    <IconButton
                                                        onClick={() => handleRemoveAdditionalInfo(index)}
                                                        color="error"
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
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
                                <CardContent>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerFileChange}
                                        style={{ marginBottom: '1rem' }}
                                        required
                                    />
                                    {!bannerPreview && <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 1 }}>
                                        (max size: 2MB) <span style={{ color: "red" }}>192 x 148</span>
                                    </Box>}
                                    {bannerPreview && (
                                        <Box sx={{ mt: 2 }}>
                                            <img
                                                src={bannerPreview}
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
                                        * Image is required (max size: 2MB) <span style={{ color: "red" }}>500 x 625</span>
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