import { Box, Typography } from '@mui/material';
import React from 'react';
import hourlyLogo from '../../images/hourlyLogo.png';

/**
 * The Hourly logo and the app title.
 * @returns Homepage title.
 */
export default function Title() {
  return (
    <Box
      flexDirection="row"
      display="flex"
      flex={1}
      justifyContent="center"
      alignItems="center"
    >
      <Box flex={6} display="flex" justifyContent="flex-end">
        <img src={hourlyLogo} alt="Hourly Logo" width="170px" height="auto" />
      </Box>
      <Box flex={6} display="flex" justifyContent="flex-start">
        <Typography variant="homeTitle" color="white">
          Hourly
        </Typography>
      </Box>
    </Box>
  );
}
