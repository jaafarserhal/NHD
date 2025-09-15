import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip } from '@mui/material';
import Footer from 'src/components/Footer';
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';

function Products() {
    const { data: products, loading, error, refetch } = useApiCall(
        () => productService.getProducts(),
        []
    );


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    if (!products || !products.data || products.data.length === 0) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h6" color="textSecondary" align="center">
                    No products found.
                </Typography>
            </Container>
        );
    }

    const columns = [
        {
            key: 'createdAt',
            label: 'Date'
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
            key: 'isActive',
            label: 'Status',
            render: (user) => (
                <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                />
            )
        }
    ];

    return (
        <>
            <Helmet>
                <title>Products - Applications</title>
            </Helmet>
            <PageTitleWrapper>
                <PageHeader sectionTitle="Product" />
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
                        <GenericTable
                            data={products && products.data ? products.data : []}
                            idKey="id"
                            columns={columns}
                            onEdit={(user) => console.log('Edit', user)}
                            onDelete={(user) => console.log('Delete', user)}
                        />
                    </Grid>
                </Grid>
            </Container>
            <Footer />
        </>
    );
}

export default Products;
