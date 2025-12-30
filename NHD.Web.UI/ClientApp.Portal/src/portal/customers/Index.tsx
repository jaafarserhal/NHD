import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip, Box } from '@mui/material';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';
import { useNavigate } from 'react-router-dom';
import customerService from '../../api/customerService';
import ConfirmDialog from 'src/components/ConfirmDialog/Index';
import { CustomerStatusEnum } from 'src/common/Enums';

function Customers() {
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const navigate = useNavigate();


    const { data: customers, loading, error, refetch } = useApiCall(
        () => customerService.getCustomers(page + 1, limit),
        [page, limit]
    );

    // helper to compute next status
    const getNextStatus = (statusId) =>
        statusId === CustomerStatusEnum.Active
            ? CustomerStatusEnum.Inactive
            : CustomerStatusEnum.Active;

    const columns = [
        {
            key: 'createdAt',
            label: 'Date',
            render: (customer) => {
                return (
                    <span>
                        {new Date(customer.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric'
                        })}{' '}
                        -{' '}
                        {new Date(customer.createdAt).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: false
                        })}
                    </span>
                );
            }
        },
        {
            key: 'fullName',
            label: 'Full Name'
        },
        {
            key: 'email',
            label: 'Email'
        },
        {
            key: 'mobile',
            label: 'Mobile'
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Chip
                    label={row.status}
                    color={
                        row.statusId === CustomerStatusEnum.Active
                            ? 'success'
                            : row.statusId === CustomerStatusEnum.Inactive
                                ? 'warning'
                                : 'error'
                    }
                    size="small"
                />
            )
        }
    ];

    const handlePageChange = (newPage) => setPage(newPage);

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(0);
    };

    const handleUpdateStatus = (customer) => {
        setSelectedCustomer(customer);
        setConfirmOpen(true);
    };

    const handleConfirmUpdateStatus = async () => {
        if (!selectedCustomer) return;

        const nextStatus = getNextStatus(selectedCustomer.statusId);

        try {

            await customerService.updateCustomerStatus(
                { CustomerId: selectedCustomer.id, StatusId: nextStatus }
            );
            await refetch();
        } catch (err) {
            console.error('update failed:', err);
        } finally {
            setConfirmOpen(false);
            setSelectedCustomer(null);
        }
    };

    const handleCancelUpdateStatus = () => {
        setConfirmOpen(false);
        setSelectedCustomer(null);
    };

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography color="error">
                    Error loading customers: {error.message}
                </Typography>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh" overflow="hidden">
            <Helmet>
                <title>Customers - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Customers" enableAddButton={false} />
            </PageTitleWrapper>

            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
            >
                {!customers || !customers.data || customers.data.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No customers found.
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
                                data={customers.data}
                                idKey="id"
                                columns={columns}
                                onUpdateStatus={handleUpdateStatus}
                                onRedirect={(prd) => navigate(`/addresses/${prd.id}/${encodeURIComponent(prd.fullName)}`)}
                                redirectTitle="Addresses"
                                currentPage={page}
                                pageSize={limit}
                                totalCount={customers.total || customers.data.length}
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
                onClose={handleCancelUpdateStatus}
                onConfirm={handleConfirmUpdateStatus}
                title="Update Status"
                message={
                    selectedCustomer
                        ? `Are you sure you want to ${selectedCustomer.statusId === CustomerStatusEnum.Active
                            ? 'deactivate'
                            : 'activate'
                        } this customer?`
                        : ''
                }
                confirmText="Yes, Update"
                cancelText="Cancel"
                confirmVariant="danger"
            />
        </Box>
    );
}

export default Customers;
