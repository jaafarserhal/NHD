import { Helmet } from 'react-helmet-async';
import { Grid, Container, Typography, Chip, Box, AlertColor } from '@mui/material';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import GenericTable from 'src/components/GenericTable/index';
import customerService from 'src/api/customerService';
import { RouterUrls } from 'src/common/RouterUrls';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { useParams } from 'react-router-dom';
import PageTitle from 'src/components/PageTitle';


function Addresses() {
    const { customerId, title } = useParams<{ customerId?: string, title?: string }>();
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);


    // Convert 0-based page to 1-based for API
    const { data: addresses, loading, error, refetch } = useApiCall(
        () => customerService.getAddressesByCustomerId(customerId, page + 1, limit),
        [page, limit] // Dependencies to refetch when page/limit changes
    );


    const columns = [
        {
            key: 'createdAt',
            label: 'Date',
            render: (faq) => {
                return (
                    <span>
                        {new Date(faq.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(faq.createdAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: false,
                        })}
                    </span>
                );
            }
        },
        {
            key: 'fullName',
            label: 'Full Name',
        },
        {
            key: 'phone',
            label: 'Phone',
        },
        {
            key: 'streetName',
            label: 'Street Name',
        },
        {
            key: 'streetNumber',
            label: 'Street Number',
        },
        {
            key: 'postalCode',
            label: 'Postal Code',
        },
        {
            key: 'city',
            label: 'City',
        },
        {
            key: 'isPrimary',
            label: 'Is Primary',
        },
        {
            key: 'type',
            label: 'Type',
        },
    ];

    // Handle pagination changes
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(0); // Reset to first page when changing page size
    };



    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography color="error">Error loading contacts: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            overflow="hidden"
        >
            <Helmet>
                <title>{title} | Addresses - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageTitle
                    heading="Addresses"
                    subHeading={`${title} | Manage addresses associated with this customer`}
                    backUrl={`${RouterUrls.customersList}`} />
            </PageTitleWrapper>
            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {!addresses || !addresses.data || addresses.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No Addresses found.
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
                                data={addresses.data}
                                idKey="id"
                                columns={columns}

                                currentPage={page}
                                pageSize={limit}
                                totalCount={addresses.total || addresses.data.length}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handleLimitChange}
                                disableInternalPagination={true}
                            />
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default Addresses;