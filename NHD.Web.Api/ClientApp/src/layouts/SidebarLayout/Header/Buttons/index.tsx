import { Box } from '@mui/material';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

function HeaderButtons() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.clear(); // Clears all localStorage
    // OR, if you only want to remove specific items:
    // localStorage.removeItem('user');
    // localStorage.removeItem('authToken');

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
