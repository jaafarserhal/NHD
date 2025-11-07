import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip, Box } from '@mui/material';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';
import ConfirmDialog from 'src/components/ConfirmDialog/Index';
import { useNavigate } from 'react-router-dom';
import { RouterUrls } from 'src/common/RouterUrls';
import { getImageSrc } from 'src/common/getImageSrc';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import sectionService from 'src/api/sectionService';

function Sections() {
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const navigate = useNavigate();

    // Convert 0-based page to 1-based for API
    const { data: sections, loading, error, refetch } = useApiCall(
        () => sectionService.getSections(page + 1, limit),
        [page, limit] // Dependencies to refetch when page/limit changes
    );

    const handleDeleteClick = (section) => {
        setSelectedSection(section);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSection) return;
        try {
            await sectionService.deleteSection(selectedSection.id);
            setConfirmOpen(false);
            setSelectedSection(null);
            refetch(); // refresh table
        } catch (err) {
            console.error("Delete failed:", err);
            setConfirmOpen(false);
        }
        setConfirmOpen(false);
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setSelectedSection(null);
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
            key: 'titleEn',
            label: 'Title (EN)',
        },
        {
            key: 'titleSv',
            label: 'Title (SV)'
        },
        {
            key: 'imageUrl',
            label: 'Image',
            render: (sec) => (
                <LazyLoadImage
                    src={getImageSrc(sec.imageUrl, 'sections')}
                    alt={sec.titleEn}
                    effect="blur"
                    width="50px"
                    height="50px"
                    style={{
                        objectFit: 'cover',
                        borderRadius: '4px'
                    }}
                />
            )
        }
        , {
            key: 'isHomeSlider',
            label: 'Home Slider',
            render: (sec) => (
                <Chip
                    label={sec.isHomeSlider ? 'Yes' : 'No'}
                    color={sec.isHomeSlider ? 'primary' : 'default'}
                    size="small"
                />
            )
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (sec) => (
                <Chip
                    label={sec.isActive ? 'Active' : 'Inactive'}
                    color={sec.isActive ? 'success' : 'error'}
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
                <Typography color="error">Error loading Sections: {error.message}</Typography>
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
                <title>Sections - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Sections" href={RouterUrls.sectionAdd} />
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
                {!sections || !sections.data || sections.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No Sections found.
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
                                data={sections.data}
                                idKey="id"
                                columns={columns}
                                onEdit={(sec) => navigate(`/sections/edit/${sec.id}`)}
                                onDelete={(sec) => handleDeleteClick(sec)}
                                currentPage={page}
                                pageSize={limit}
                                totalCount={sections.total || sections.data.length}
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
                title="Delete Box"
                message={`Are you sure you want to delete this item? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
            />
        </Box>
    );
}

export default Sections;