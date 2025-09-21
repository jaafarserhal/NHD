import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip, Box } from '@mui/material';
import Footer from 'src/components/Footer';
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';
import { render } from 'react-dom';

function Products() {
    const { data: products, loading, error, refetch } = useApiCall(
        () => productService.getProducts(),
        []
    );

    const columns = [
        {
            key: 'createdAt',
            label: 'Date',
            render: (prd) => {
                return (
                    <span>
                        {new Date(prd.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(prd.createdAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: false, // change to false for 24-hour format
                        })}
                    </span>
                );
            }
        },
        {
            key: 'name',
            label: 'Name',
        },
        {
            key: 'category',
            label: 'Category'
        },
        {
            key: 'type',
            label: 'Type'
        },
        {
            key: 'size',
            label: 'Size'
        },
        {
            key: 'price',
            label: 'Price'
        },
        {
            key: 'imageUrl',
            label: 'Image',
            render: (prd) => (
                <img
                    src={prd.imageUrl ? `/uploads/products/${prd.imageUrl}` : "/uploads/placeholder-image.png"}
                    alt={prd.name}
                    style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                    }}
                />

            )
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (prd) => (
                <Chip
                    label={prd.isActive ? 'Active' : 'Inactive'}
                    color={prd.isActive ? 'success' : 'error'}
                    size="small"
                />
            )
        }
    ];

    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            overflow="hidden"
        >
            <Helmet>
                <title>Products - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Product" />
            </PageTitleWrapper>

            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center", // centers vertically if little content
                }}
            >
                {!products || !products.data || products.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No products found.
                    </Typography>
                ) : (
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="stretch"
                        spacing={3}
                        sx={{ flex: 1 }}
                    >
                        <Grid item xs={12}>
                            <GenericTable
                                data={products.data}
                                idKey="id"
                                columns={columns}
                                onEdit={(user) => console.log("Edit", user)}
                                onDelete={(user) => console.log("Delete", user)}
                            />
                        </Grid>
                    </Grid>
                )}
            </Container>

            <Footer />
        </Box>
    );

}
export default Products;
