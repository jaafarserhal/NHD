import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Chip, Box } from '@mui/material';
import Footer from 'src/components/Footer';
import { useState } from 'react';
import { useApiCall } from '../../api/hooks/useApi';
import productService from '../../api/productService';
import GenericTable from 'src/components/GenericTable/index';
import PageHeader from '../PageHeader';
import ConfirmDialog from 'src/components/ConfirmDialog/Index';
import { useNavigate } from 'react-router-dom';
import { RouterUrls } from 'src/common/RouterUrls';

function Transactions() {


    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            overflow="hidden"
        >
            <Helmet>
                <title>Transactions - Applications</title>
            </Helmet>

            <PageTitleWrapper>
                <PageHeader sectionTitle="Transactions" enableAddButton={false} />
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
                <Typography variant="h6" color="textSecondary" align="center">
                    No Transactions found.
                </Typography>
            </Container>
        </Box>
    );
}

export default Transactions;