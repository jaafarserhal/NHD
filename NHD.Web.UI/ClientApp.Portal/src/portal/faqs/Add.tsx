import React, { useState } from "react";
import { Card, CardContent, Button, Box, CardHeader, Container, Divider, FormControlLabel, Grid, Switch, TextField } from "@mui/material";
import { Faq, Section } from "../models/Types";
import sectionsService from '../../api/sectionService';
import { Helmet } from "react-helmet-async";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import Editor from "src/components/Editor/Index";
import { useNavigate } from 'react-router-dom';
import { PortalToastContainer } from "src/components/Toaster/Index";
import { RouterUrls } from "src/common/RouterUrls";
import { useApiCall } from "src/api/hooks/useApi";
import { SectionType } from "src/common/Enums";
import { set } from "date-fns";
import { getImageResolutionLabel } from "src/common/Utils";
import { validateFileSize } from "src/common/fileValidation";
import faqService from "src/api/faqService";

export default function AddFaq() {

    const navigate = useNavigate();

    const [form, setForm] = useState<Omit<Faq, "id">>({
        questionEn: "",
        questionSv: "",
        answerEn: "",
        answerSv: "",
        typeId: 0,
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const errorBoxRef = React.useRef<HTMLDivElement>(null);

    const { data: types, loading: typesLoading } = useApiCall(
        () => faqService.getFaqTypes(),
        []
    );


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
        if (!form.typeId) {
            validationErrors.push("Type is required");
        }
        if (!form.questionEn.trim()) {
            validationErrors.push("English question is required");
        }
        if (!form.questionSv.trim()) {
            validationErrors.push("Swedish question is required");
        }
        if (!form.answerEn.trim()) {
            validationErrors.push("English answer is required");
        }
        if (!form.answerSv.trim()) {
            validationErrors.push("Swedish answer is required");
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

            const faqData: Omit<Faq, "id"> = {
                questionEn: form.questionEn,
                questionSv: form.questionSv,
                answerEn: form.answerEn,
                answerSv: form.answerSv,
                typeId: form.typeId,
                isActive: form.isActive,
            };

            await faqService.addFaq(faqData);

            navigate(RouterUrls.faqsList);
            // Reset form
            setForm({
                questionEn: "",
                questionSv: "",
                answerEn: "",
                answerSv: "",
                isActive: true,
                typeId: 0,
            });
        } catch (error: any) {
            console.error(error);
            setErrors([error.message || 'Failed to add faq. Please try again.']);
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <PortalToastContainer />
            <Helmet>
                <title>Add Faq - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Add Faq"
                    subHeading="Add a new faq to your catalog"
                    backUrl={RouterUrls.faqsList}
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
                                <CardHeader title="FAQ Type" />
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
                                <CardHeader title="Details" />
                                <Divider />
                                <CardContent>
                                    <Box sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}>
                                        <TextField
                                            required
                                            name="questionEn"
                                            label="Question (English)"
                                            value={form.questionEn}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                        <Box sx={{ m: 1 }}>
                                            <Editor
                                                label="Answer (English)"
                                                value={form.answerEn}
                                                onChange={(content) => handleEditorChange('answerEn', content)}
                                            />
                                        </Box>
                                        <TextField
                                            required
                                            name="questionSv"
                                            label="Question (Swedish)"
                                            value={form.questionSv}
                                            onChange={handleChange}
                                            variant="standard"
                                            fullWidth
                                        />
                                        <Box sx={{ m: 1 }}>
                                            <Editor
                                                label="Answer (Swedish)"
                                                value={form.answerSv}
                                                onChange={(content) => handleEditorChange('answerSv', content)}
                                            />
                                        </Box>
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
                            onClick={() => navigate(RouterUrls.faqsList)}
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