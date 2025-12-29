import { Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  sectionTitle?: string;
  href?: string;
  enableAddButton?: boolean;
  action?: 'add' | 'export';
  onExport?: () => void;
  isExporting?: boolean;
}

function PageHeader({
  sectionTitle = '',
  href = '',
  enableAddButton = true,
  action = 'add',
  onExport,
  isExporting = false
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  const handleAdd = () => {
    if (!href) return;
    navigate(href);
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {sectionTitle}
        </Typography>
      </Grid>

      <Grid item>
        {action === 'export' ? (
          <Button
            onClick={handleExport}
            sx={{ mt: { xs: 2, md: 0 } }}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        ) : (
          enableAddButton && (
            <Button
              onClick={handleAdd}
              sx={{ mt: { xs: 2, md: 0 } }}
              variant="contained"
              startIcon={<AddTwoToneIcon fontSize="small" />}
              disabled={!href}
            >
              Add {sectionTitle}
            </Button>
          )
        )}
      </Grid>
    </Grid>
  );
}

export default PageHeader;
