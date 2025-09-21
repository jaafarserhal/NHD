import React, { useState } from "react";
import { Card, CardContent, TextField as Input, Button, Box, CardHeader, Checkbox, Container, Divider, FormControl, FormControlLabel, FormLabel, Grid, MenuItem, Radio, RadioGroup, Slider, Stack, Switch, TextField } from "@mui/material";
import { Product } from "../models/Types";
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import { Helmet } from "react-helmet-async";
import Footer from "src/components/Footer";
import PageTitle from "src/components/PageTitle";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import Editor from "src/components/Editor/Index";
import UploadImage from "src/components/UploadImage/Index";



export default function AddProduct() {
    const [form, setForm] = useState<Omit<Product, "id" | "imageUrl">>({
        categoryId: undefined,
        typeId: undefined,
        sizeId: undefined,
        nameEN: "",
        nameSV: "",
        descriptionEN: "",
        descriptionSV: "",
        price: 0,
        isActive: true,
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [submitFormData, setSubmitFormData] = useState<FormData | null>(null);

    // Use useApiCall for the add product API call
    const { data: addedProduct, loading, error, refetch: addProduct } = useApiCall(
        () => submitFormData ? productService.addProduct(submitFormData) : Promise.resolve(null),
        [submitFormData]
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : name.toLowerCase().includes("id") || name === "price"
                        ? Number(value)
                        : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            alert("Please select an image");
            return;
        }

        const formData = new FormData();

        // Append form data with correct field names
        Object.entries(form).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });
        formData.append("image", image);

        // Trigger the API call by setting the form data
        setSubmitFormData(formData);
    };

    // Handle the result of the API call
    React.useEffect(() => {
        if (addedProduct && !loading && !error) {
            alert(`Product added successfully!`);

            // Reset form
            setForm({
                categoryId: undefined,
                typeId: undefined,
                sizeId: undefined,
                nameEN: "",
                nameSV: "",
                descriptionEN: "",
                descriptionSV: "",
                price: 0,
                isActive: true,
            });
            setImage(null);
            setPreview(null);
            setSubmitFormData(null);

            // Clear the file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        }

        if (error) {
            console.error(error);
            alert(`Error while saving product: ${error.message || 'Unknown error'}`);
            setSubmitFormData(null);
        }
    }, [addedProduct, loading, error]);

    // return (
    //     <Card className="max-w-2xl mx-auto mt-8 shadow-lg rounded-2xl">
    //         <CardContent>
    //             <h2 className="text-2xl font-bold mb-6 text-center">Add New Product</h2>
    //             <form onSubmit={handleSubmit} className="space-y-5">
    //                 {/* Category ID */}
    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="categoryId" className="text-sm font-medium text-gray-700">
    //                         Category ID
    //                     </label>
    //                     <Input
    //                         id="categoryId"
    //                         type="number"
    //                         name="categoryId"
    //                         value={form.categoryId ?? ""}
    //                         onChange={handleChange}
    //                         required
    //                     />
    //                 </div>

    //                 {/* Type ID */}
    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="typeId" className="text-sm font-medium text-gray-700">
    //                         Type ID
    //                     </label>
    //                     <Input
    //                         id="typeId"
    //                         type="number"
    //                         name="typeId"
    //                         value={form.typeId ?? ""}
    //                         onChange={handleChange}
    //                         required
    //                     />
    //                 </div>

    //                 {/* Size ID */}
    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="sizeId" className="text-sm font-medium text-gray-700">
    //                         Size ID
    //                     </label>
    //                     <Input
    //                         id="sizeId"
    //                         type="number"
    //                         name="sizeId"
    //                         value={form.sizeId ?? ""}
    //                         onChange={handleChange}
    //                         required
    //                     />
    //                 </div>

    //                 {/* Names */}
    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="nameEN" className="text-sm font-medium text-gray-700">
    //                         Name (English)
    //                     </label>
    //                     <Input
    //                         id="nameEN"
    //                         type="text"
    //                         name="nameEN"
    //                         value={form.nameEN}
    //                         onChange={handleChange}
    //                         required
    //                     />
    //                 </div>

    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="nameSV" className="text-sm font-medium text-gray-700">
    //                         Name (Swedish)
    //                     </label>
    //                     <Input
    //                         id="nameSV"
    //                         type="text"
    //                         name="nameSV"
    //                         value={form.nameSV}
    //                         onChange={handleChange}
    //                         required
    //                     />
    //                 </div>

    //                 {/* Descriptions */}
    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="descriptionEN" className="text-sm font-medium text-gray-700">
    //                         Description (English)
    //                     </label>
    //                     <Textarea
    //                         id="descriptionEN"
    //                         name="descriptionEN"
    //                         value={form.descriptionEN}
    //                         onChange={handleChange}
    //                         minRows={3}
    //                         className="w-full resize-y"
    //                     />
    //                 </div>

    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="descriptionSV" className="text-sm font-medium text-gray-700">
    //                         Description (Swedish)
    //                     </label>
    //                     <Textarea
    //                         id="descriptionSV"
    //                         name="descriptionSV"
    //                         value={form.descriptionSV}
    //                         onChange={handleChange}
    //                         minRows={3}
    //                         className="w-full resize-y"
    //                     />
    //                 </div>

    //                 {/* Price */}
    //                 <div className="flex flex-col space-y-1">
    //                     <label htmlFor="price" className="text-sm font-medium text-gray-700">
    //                         Price
    //                     </label>
    //                     <Input
    //                         id="price"
    //                         type="number"
    //                         name="price"
    //                         value={form.price}
    //                         onChange={handleChange}
    //                         required
    //                     // min={0}
    //                     />
    //                 </div>

    //                 {/* Active checkbox */}
    //                 <label className="flex items-center space-x-2">
    //                     <input
    //                         type="checkbox"
    //                         name="isActive"
    //                         checked={form.isActive}
    //                         onChange={handleChange}
    //                         className="h-4 w-4"
    //                     />
    //                     <span className="text-sm text-gray-700">Active</span>
    //                 </label>

    //                 {/* File upload */}
    //                 <div className="flex flex-col space-y-1">
    //                     <label className="text-sm font-medium text-gray-700">Product Image</label>
    //                     <Input
    //                         type="file"
    //                         onChange={handleFileChange}
    //                         required
    //                     // accept="image/jpeg,image/jpg,image/png,image/gif"
    //                     />
    //                 </div>

    //                 {/* Preview */}
    //                 {preview && (
    //                     <div className="mt-2">
    //                         <img
    //                             src={preview}
    //                             alt="Preview"
    //                             className="h-32 rounded-lg object-cover border border-gray-300"
    //                         />
    //                     </div>
    //                 )}

    //                 {/* Submit */}
    //                 <Button
    //                     type="submit"
    //                     disabled={loading}
    //                     className="w-full py-2 rounded-xl"
    //                 >
    //                     {loading ? "Saving..." : "Save Product"}
    //                 </Button>
    //             </form>
    //         </CardContent>
    //     </Card>
    // );
    const label = { inputProps: { 'aria-label': 'Switch demo' } };
    const currencies = [
        {
            value: 'USD',
            label: '$'
        },
        {
            value: 'EUR',
            label: '€'
        },
        {
            value: 'BTC',
            label: '฿'
        },
        {
            value: 'JPY',
            label: '¥'
        }
    ];

    const [currency, setCurrency] = useState('EUR');

    return (
        <>
            <Helmet>
                <title>Products - Application</title>
            </Helmet>
            <PageTitleWrapper>
                <PageTitle
                    heading="Dates"
                    subHeading="Manage your dates"
                />
            </PageTitleWrapper>
            <Container maxWidth="lg">
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
                                <Box
                                    component="form"
                                    sx={{
                                        '& .MuiTextField-root': { m: 1, width: '100ch' }
                                    }}
                                    noValidate
                                    autoComplete="off"
                                >
                                    <div>
                                        <TextField
                                            required
                                            id="standard-required"
                                            label="Required"
                                            defaultValue="English Name"
                                            variant="standard"
                                        />
                                        <Editor label="English Description" />
                                        <TextField
                                            required
                                            id="standard-required"
                                            label="Required"
                                            defaultValue="Swedish Name"
                                            variant="standard"
                                        />
                                        <Editor label="Swedish Description" />
                                    </div>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Categories" />
                            <Divider />
                            <CardContent>
                                <Box
                                    component="form"
                                    sx={{
                                        '& .MuiTextField-root': { m: 1, width: '100ch' }
                                    }}
                                    noValidate
                                    autoComplete="off"
                                >
                                    <div>
                                        <TextField
                                            id="standard-select-currency-native"
                                            select
                                            label="Dates Category"
                                            value={currency}
                                            onChange={handleChange}
                                            SelectProps={{
                                                native: true
                                            }}
                                            helperText="Please select your category"
                                            variant="standard"
                                        >
                                            {currencies.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </TextField>

                                        <TextField
                                            id="standard-select-currency-native"
                                            select
                                            label="Dates Type"
                                            value={currency}
                                            onChange={handleChange}
                                            SelectProps={{
                                                native: true
                                            }}
                                            helperText="Please select your Type"
                                            variant="standard"
                                        >
                                            {currencies.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </TextField>

                                        <TextField
                                            id="standard-select-currency-native"
                                            select
                                            label="Dates Size"
                                            value={currency}
                                            onChange={handleChange}
                                            SelectProps={{
                                                native: true
                                            }}
                                            helperText="Please select your Size"
                                            variant="standard"
                                        >
                                            {currencies.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </TextField>
                                    </div>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Image Upload" />
                            <Divider />
                            <CardContent>
                                <UploadImage />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Active" />
                            <Divider />
                            <CardContent>
                                <Switch {...label} defaultChecked />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                {/* Submit */}
                <Box textAlign='center' m={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        className="w-25 py-2 rounded-xl"
                        onClick={handleSubmit}
                    >
                        {loading ? "Saving..." : "Save Product"}
                    </Button>
                </Box>
            </Container>
            <Footer />
        </>
    );
}