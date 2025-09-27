import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField, Backdrop, CircularProgress } from "@mui/material";
import { Date } from "../models/Types";
import dateService from '../../api/dateService';
import { Helmet } from "react-helmet-async";
import Footer from "src/components/Footer";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import Editor from "src/components/Editor/Index";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PortalToastContainer } from "src/components/Toaster/Index";

export default function UpdateDate() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState<Date>({
        id: 0,
        nameEn: "",
        nameSv: "",
        quality: false,
        price: 0,
        isActive: true
    });


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
                price: date.price,
                isActive: date.isActive
            });


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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
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
        if (form.price === null || form.price === undefined || isNaN(form.price) || form.price < 0) {
            validationErrors.push("Valid price is required");
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
                nameEn: form.nameEn,
                nameSv: form.nameSv,
                quality: form.quality,
                price: form.price,
                isActive: form.isActive
            };

            await dateService.updateDate(productData);

            notifySuccess();
            navigate('/dates');
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
                <title>Update Set - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Update Date"
                    subHeading="Update existing date information"
                    backUrl="/dates"
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
                                <CardHeader title="Set Details" />
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
                                            name="price"
                                            label="Price"
                                            type="number"
                                            value={form.price}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                            inputProps={{ min: 0, step: "0.01" }}
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
                            onClick={() => navigate('/dates')}
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