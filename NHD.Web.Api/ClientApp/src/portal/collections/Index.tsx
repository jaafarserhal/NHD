import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip, Box } from '@mui/material';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import dateService from '../../api/dateService';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';
import ConfirmDialog from 'src/components/ConfirmDialog/Index';
import { useNavigate } from 'react-router-dom';
import { RouterUrls } from 'src/common/RouterUrls';
import { getImageSrc } from 'src/common/getImageSrc';

function Collections() {
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const navigate = useNavigate();

    // Convert 0-based page to 1-based for API
    const { data: collections, loading, error, refetch } = useApiCall(
        () => dateService.getCollections(page + 1, limit),
        [page, limit] // Dependencies to refetch when page/limit changes
    );

    const handleDeleteClick = (collection) => {
        setSelectedCollection(collection);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCollection) return;
        try {
            await dateService.deleteCollection(selectedCollection.id);
            setConfirmOpen(false);
            setSelectedCollection(null);
            refetch(); // refresh table
        } catch (err) {
            console.error("Delete failed:", err);
            setConfirmOpen(false);
        }
        setConfirmOpen(false);
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setSelectedCollection(null);
    };

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
                            hour12: false,
                        })}
                    </span>
                );
            }
        },
        {
            key: 'nameEn',
            label: 'Name',
        },
        {
            key: 'imageUrl',
            label: 'Image',
            render: (prd) => (
                <img
                    src={getImageSrc(prd.imageUrl, 'collections')}
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
                <Typography color="error">Error loading collections: {error.message}</Typography>
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
                <title>Collections - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Collections" href={RouterUrls.collectionAdd} />
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
                {!collections || !collections.data || collections.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No collections found.
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
                                data={collections.data}
                                idKey="id"
                                columns={columns}
                                onEdit={(collection) => navigate(`/collections/edit/${collection.id}`)}
                                onDelete={(collection) => handleDeleteClick(collection)}
                                currentPage={page}
                                pageSize={limit}
                                totalCount={collections.total || collections.data.length}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handleLimitChange}
                                disableInternalPagination={true}
                            />
                        </Grid>
                    </Grid>
                )}
            </Container>

            <ConfirmDialog
                open={confirmOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Date"
                message={`Are you sure you want to delete this item? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
            />
        </Box>
    );
}

export default Collections;