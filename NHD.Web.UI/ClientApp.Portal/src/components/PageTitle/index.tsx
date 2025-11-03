import { FC } from 'react';
import PropTypes from 'prop-types';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router';

interface PageTitleProps {
  heading?: string;
  subHeading?: string;
  backUrl?: string;
}

const PageTitle: FC<PageTitleProps> = ({
  heading = '',
  subHeading = '',
  backUrl = '',
  ...rest
}) => {
  const navigate = useNavigate();

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      {...rest}
    >
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {heading}
        </Typography>
        <Typography variant="subtitle2">{subHeading}</Typography>
      </Grid>
      <Grid item>
        <Button
          onClick={() => navigate(backUrl)}
          sx={{ mt: { xs: 2, md: 0 } }}
          variant="contained"
        >
          Back to List
        </Button>
      </Grid>
    </Grid>
  );
};

PageTitle.propTypes = {
  heading: PropTypes.string,
  subHeading: PropTypes.string,
  backUrl: PropTypes.string
};

export default PageTitle;
