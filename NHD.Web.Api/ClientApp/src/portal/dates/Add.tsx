import React, { useState } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField } from "@mui/material";
import { Date } from "../models/Types";
import { useApiCall } from '../../api/hooks/useApi';
import dateService from '../../api/dateService';
import { Helmet } from "react-helmet-async";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import { useNavigate } from 'react-router-dom';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { RouterUrls } from "src/common/RouterUrls";

export default function AddDate() {

    const navigate = useNavigate();

    const { data: activeCollections, loading: activeCollectionsLoading } = useApiCall(
        () => dateService.getActiveCollections(),
        []
    );


    const [form, setForm] = useState<Omit<Date, "id">>({
        nameEn: "",
        nameSv: "",
        collectionId: 0,
        quality: false,
        unitPrice: undefined,
        weightPrice: undefined,
        isActive: true,
    });


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
        if (!form.collectionId || form.collectionId <= 0) {
            validationErrors.push("Collection selection is required");
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

            const dateData: Omit<Date, "id"> = {
                nameEn: form.nameEn,
                nameSv: form.nameSv,
                collectionId: form.collectionId,
                quality: form.quality,
                unitPrice: form.unitPrice || 0,
                weightPrice: form.weightPrice || 0,
                isActive: form.isActive,
            };
            await dateService.addDate(dateData);

            navigate(RouterUrls.datesList);

            // Reset form
            setForm({
                nameEn: "",
                nameSv: "",
                collectionId: 0,
                quality: false,
                unitPrice: undefined,
                weightPrice: undefined,
                isActive: true,
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
                                            label="English Name"
                                            value={form.nameEn}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />

                                        <TextField
                                            required
                                            name="nameSv"
                                            label="Swedish Name"
                                            value={form.nameSv}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />

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
                                        <TextField
                                            required
                                            name="collectionId"
                                            select
                                            value={form.collectionId || ''}
                                            onChange={handleChange}
                                            SelectProps={{ native: true }}
                                            variant="standard"
                                            disabled={activeCollectionsLoading}
                                        >
                                            <option value="">Select Collection</option>
                                            {activeCollections?.data?.map((option) => (
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
                                <CardHeader title="Premium" />
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