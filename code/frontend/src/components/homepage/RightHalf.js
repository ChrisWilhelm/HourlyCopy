import { Box, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';
import Controls from '../reusable/controls/Controls';

/**
 * Represents the right half of the homepage where the user can choose to sign up for
 * an account or login.
 * @returns the right half of the homepage.
 */
export default function RightHalf() {
  const navigate = useNavigate();

  const signUp = () => {
    navigate('/signup');
  };

  const login = () => {
    navigate('/login');
  };

  return (
    <Box
      flex={11}
      display="flex"
      justifyContent="center"
      flexDirection={{ xs: 'row', sm: 'row', md: 'column' }}
      paddingTop={{ xs: '5%', sm: '5%', md: '20%' }}
      paddingBottom={{ xs: '5%', sm: '5%', md: '30%' }}
    >
      <Box
        flex={3}
        display="flex"
        justifyContent="center"
        alignItems={{ xs: 'center', sm: 'center', md: 'flex-end' }}
      >
        <Typography variant="slogan" color="primary">
          Office Hours <br /> Made Better
        </Typography>
      </Box>
      <Box flex={2} display="flex" flexDirection="column">
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Controls.Button
            text="Get Started"
            width="72%"
            fontSize="1.5rem"
            onClick={signUp}
          />
          <Controls.Button
            text="Login"
            width="72%"
            fontSize="1.5rem"
            onClick={login}
          />
        </Box>
      </Box>
    </Box>
  );
}
