import { Box, Typography } from '@mui/material';
import React from 'react';

/**
 * Represents the functionalities that are listed on the bottom half of the homepage.
 * @param {*} props:
 * required: isLeft: boolean that generates different functionalites based on which
 *                   half the component will be used
 * @returns a list of 3 functionalities that appear on one half of the homepage.
 */
export default function Functionalities(props) {
  const { isLeft } = props;

  // Create a single functionality.
  const functionality = (text, index, color) => {
    return (
      <Box flex={3} key={index} display="flex" justifyContent="center">
        <Typography variant="functionalities" color={color}>
          {text}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      flexDirection="row"
      display="flex"
      flex={1}
      justifyContent="space-around"
    >
      {isLeft
        ? ['Analyze', 'Schedule', 'Review'].map((text, index) =>
            functionality(text, index, 'white'),
          )
        : ['Register', 'Calendar', 'Queue'].map((text, index) =>
            functionality(text, index, 'primary'),
          )}
    </Box>
  );
}
