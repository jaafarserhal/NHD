import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip, Box } from '@mui/material';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';

import { useNavigate } from 'react-router-dom';
import { RouterUrls } from 'src/common/RouterUrls';
import propertiesService from 'src/api/proptiesService';


function Properties() {
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);
    const navigate = useNavigate();

    // Convert 0-based page to 1-based for API
    const { data: properties, loading, error, refetch } = useApiCall(
        () => propertiesService.getProperties(page + 1, limit),
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
            key: 'title',
            label: 'Title',
        },
        {
            key: 'valueEn',
            label: 'Value (EN)',
        },
        {
            key: 'valueSv',
            label: 'Value (SV)',
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
                <Typography color="error">Error loading Properties: {error.message}</Typography>
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
                <title>Properties - Applications</title>
            </Helmet>

            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {!properties || !properties.data || properties.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No Properties found.
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
                                data={properties.data}
                                idKey="id"
                                columns={columns}
                                onEdit={(property) => navigate(`/properties/edit/${property.id}`)}
                                currentPage={page}
                                pageSize={limit}
                                totalCount={properties.total || properties.data.length}
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

export default Properties;