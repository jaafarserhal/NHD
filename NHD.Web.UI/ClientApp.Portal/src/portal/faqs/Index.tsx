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
import { getImageSrc } from 'src/common/Utils';
import faqService from 'src/api/faqService';

function Faqs() {
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState(null);
    const navigate = useNavigate();

    // Convert 0-based page to 1-based for API
    const { data: faqs, loading, error, refetch } = useApiCall(
        () => faqService.getFaqs(page + 1, limit),
        [page, limit] // Dependencies to refetch when page/limit changes
    );

    const handleDeleteClick = (faq) => {
        setSelectedFaq(faq);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedFaq) return;
        try {
            await faqService.deleteFaq(selectedFaq.id);
            setConfirmOpen(false);
            setSelectedFaq(null);
            refetch(); // refresh table
        } catch (err) {
            console.error("Delete failed:", err);
            setConfirmOpen(false);
        }
        setConfirmOpen(false);
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setSelectedFaq(null);
    };

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
            key: 'questionEn',
            label: 'Question',
        },
        {
            key: 'answerEn',
            label: 'Answer',
        },
        {
            key: 'type',
            label: 'Type',
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
                <title>FAQs - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="FAQs" href={RouterUrls.faqAdd} />
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
                {!faqs || !faqs.data || faqs.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No FAQs found.
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
                                data={faqs.data}
                                idKey="id"
                                columns={columns}
                                onEdit={(faq) => navigate(`/faqs/edit/${faq.id}`)}
                                onDelete={(faq) => handleDeleteClick(faq)}
                                currentPage={page}
                                pageSize={limit}
                                totalCount={faqs.total || faqs.data.length}
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

export default Faqs;