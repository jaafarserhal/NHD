import { Typography, Button, Grid } from '@mui/material';

import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom';
import { hr } from 'date-fns/locale';
interface PageHeaderProps {
  sectionTitle?: string;
  href?: string;
  enableAddButton?: boolean;
}

function PageHeader({ sectionTitle, href, enableAddButton = true }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {sectionTitle}
        </Typography>
      </Grid>
      <Grid item>
        {enableAddButton && (
          <Button
            onClick={() => navigate(href)}
            sx={{ mt: { xs: 2, md: 0 } }}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
          >
            Add {sectionTitle}
          </Button>)}
      </Grid>
    </Grid>
  );
}

export default PageHeader;
