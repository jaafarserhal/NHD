import React, { useEffect, useState } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField } from "@mui/material";
import { Property } from "../models/Types";
import { Helmet } from "react-helmet-async";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import { useNavigate, useParams } from 'react-router-dom';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { RouterUrls } from "src/common/RouterUrls";
import propertiesService from "src/api/proptiesService";
import { toast } from "react-toastify";

export default function UpdateProperty() {

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState<Property>({
        id: 0,
        title: '',
        valueEn: '',
        valueSv: '',
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

    // Load existing collection data
    const loadProperty = async () => {
        if (!id) {
            setErrors(["Property ID is required"]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await propertiesService.getPropertyById(id);
            const property = response.data;

            setForm({
                id: property.id,
                title: property.title || "",
                valueEn: property.valueEn || "",
                valueSv: property.valueSv || "",
                isActive: property.isActive,
            });

        } catch (error: any) {
            console.error("Error loading property:", error);
            setErrors([error.message || 'Failed to load property. Please try again.']);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperty();
    }, [id]);


    const notifySuccess = () => {
        toast.success('Property updated successfully!', {
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


    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            isActive: e.target.checked,
        }));
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

        if (!form.title.trim()) {
            validationErrors.push("Title is required");
        }
        if (!form.valueEn.trim()) {
            validationErrors.push("English value is required");
        }
        if (!form.valueSv.trim()) {
            validationErrors.push("Swedish value is required");
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

            const propertyData: Property = {
                id: form.id,
                title: form.title,
                valueEn: form.valueEn,
                valueSv: form.valueSv,
                isActive: form.isActive,
            };

            await propertiesService.updateProperty(propertyData);
            await loadProperty().then(() => {
                notifySuccess();
            });

        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to update property. Please try again.']);
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <PortalToastContainer />
            <Helmet>
                <title>Update Property - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Update Property"
                    subHeading="Update an existing property in your catalog"
                    backUrl={RouterUrls.propertiesList}
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
                                <CardHeader title="Property Details" />
                                <Divider />
                                <CardContent>
                                    <Box sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                                        <TextField
                                            required
                                            name="title"
                                            label="Title"
                                            value={form.title}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                        <TextField
                                            required
                                            name="valueEn"
                                            label="Value (English)"
                                            value={form.valueEn}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                        <TextField
                                            required
                                            name="valueSv"
                                            label="Value (Swedish)"
                                            value={form.valueSv}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                    </Box>
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
                                        label='Active'
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
                            onClick={() => navigate(RouterUrls.propertiesList)}
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