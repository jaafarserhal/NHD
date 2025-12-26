import { Box } from '@mui/material';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { storage } from 'src/api/base/storage';


function HeaderButtons() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    storage.clearApp(); // Clears all localStorage items related to the app
    navigate('/auth/login'); // Redirect to login page
  };

  return (
    <Box sx={{ mr: 1 }}>
      <Button color="primary" fullWidth onClick={handleSignOut}>
        <LockOpenTwoToneIcon sx={{ mr: 1 }} />
        Logout
      </Button>
    </Box>
  );
}

export default HeaderButtons;
