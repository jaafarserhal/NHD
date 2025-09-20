import { Helmet } from 'react-helmet-async';
import PageHeader from '../PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip } from '@mui/material';
import Footer from 'src/components/Footer';
import { useApiCall } from '../../api/hooks/useApi';
import userService from '../../api/userService';
import GenericTable from 'src/components/GenericTable/index';




function Users() {


  const { data: users, loading, error, refetch } = useApiCall(
    () => userService.getUsers(),
    []
  );


  if (error) return <div>Error: {error.message}</div>;

  if (!users || !users.data || users.data.length === 0) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" color="textSecondary" align="center">
          No users found.
        </Typography>
      </Container>
    );
  }

  const columns = [
    {
      key: 'userId',
      label: 'ID'
    },
    {
      key: 'firstName',
      label: 'User',
      render: (user) => (
        <Typography fontWeight="bold">
          {user.firstName} {user.lastName}
        </Typography>
      )
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number'
    },
    {
      key: 'email',
      label: 'Email'
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
        <title>Users - Applications</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader sectionTitle="User" />
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
              data={users && users.data ? users.data : []}
              idKey="userId"
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

export default Users;
