import { Typography, Button, Grid } from '@mui/material';

import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

interface PageHeaderProps {
  sectionTitle?: string;
  href?: string;
}

function PageHeader({ sectionTitle, href }: PageHeaderProps) {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {sectionTitle}
        </Typography>
      </Grid>
      <Grid item>
        <Button
          sx={{ mt: { xs: 2, md: 0 } }}
          variant="contained"
          startIcon={<AddTwoToneIcon fontSize="small" />}
          href={href}
        >
          Add {sectionTitle}
        </Button>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
