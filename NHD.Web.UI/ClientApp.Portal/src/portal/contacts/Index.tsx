import { Helmet } from 'react-helmet-async';
import { Grid, Container, Typography, Chip, Box, AlertColor } from '@mui/material';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import GenericTable from 'src/components/GenericTable/index';
import contactService from 'src/api/contactService';
import { RouterUrls } from 'src/common/RouterUrls';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import PageHeader from '../PageHeader';
import { Snackbar, Alert } from '@mui/material';


function Contacts() {
    const [page, setPage] = useState(0); // 0-based for MUI TablePagination
    const [limit, setLimit] = useState(10);
    const [exporting, setExporting] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: AlertColor
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Convert 0-based page to 1-based for API
    const { data: contacts, loading, error, refetch } = useApiCall(
        () => contactService.getContactMessages(page + 1, limit),
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
            key: 'firstName',
            label: 'First Name',
        },
        {
            key: 'lastName',
            label: 'Last Name',
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'subject',
            label: 'Subject',
        },
        {
            key: 'message',
            label: 'Message',
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

    const handleExport = async () => {
        try {
            setExporting(true);
            await contactService.exportToExcel();
            setSnackbar({
                open: true,
                message: 'Contacts exported successfully!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to export contacts',
                severity: 'error'
            });
        } finally {
            setExporting(false);
        }
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
                <title>Complains - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Complains" action="export" enableAddButton={false}
                    onExport={handleExport}
                    isExporting={exporting} />
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
                {!contacts || !contacts.data || contacts.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No Contacts found.
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
                                data={contacts.data}
                                idKey="id"
                                columns={columns}

                                currentPage={page}
                                pageSize={limit}
                                totalCount={contacts.total || contacts.data.length}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handleLimitChange}
                                disableInternalPagination={true}
                            />
                        </Grid>
                    </Grid>
                )}
            </Container>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Contacts;