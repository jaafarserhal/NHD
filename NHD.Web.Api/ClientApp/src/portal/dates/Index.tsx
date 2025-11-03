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

function Dates() {
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const navigate = useNavigate();

    // Convert 0-based page to 1-based for API
    const { data: dates, loading, error, refetch } = useApiCall(
        () => dateService.getDates(page + 1, limit),
        [page, limit] // Dependencies to refetch when page/limit changes
    );

    const handleDeleteClick = (date) => {
        setSelectedDate(date);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDate) return;
        try {
            await dateService.deleteDate(selectedDate.id);
            setConfirmOpen(false);
            setSelectedDate(null);
            refetch(); // refresh table
        } catch (err) {
            console.error("Delete failed:", err);
            setConfirmOpen(false);
        }
        setConfirmOpen(false);
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setSelectedDate(null);
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
            key: 'collectionName',
            label: 'Collection',
        },
        {
            key: 'unitPrice',
            label: 'Price / piece',
        },
        {
            key: 'weightPrice',
            label: 'Price / gram',
        },
        {
            key: 'quality',
            label: 'Quality',
            render: (date) => (
                <label>{date.quality ? 'Premium' : 'Regular'}</label>
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
                <Typography color="error">Error loading products: {error.message}</Typography>
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
                <title>Dates - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Dates" href={RouterUrls.dateAdd} />
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
                {!dates || !dates.data || dates.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No dates found.
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
                                data={dates.data}
                                idKey="id"
                                columns={columns}
                                onEdit={(date) => navigate(`/dates/edit/${date.id}`)}
                                onDelete={(date) => handleDeleteClick(date)}
                                onManage={(date) => navigate(`/dates/gallery/${date.id}/${date.nameEn}`)}
                                currentPage={page}
                                pageSize={limit}
                                totalCount={dates.total || dates.data.length}
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

export default Dates;