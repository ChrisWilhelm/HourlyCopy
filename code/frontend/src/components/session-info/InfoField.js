import React from 'react';
import { Box, Typography } from '@mui/material';
import theme from '../../theme';

/**
 * Represents a single field and its value.
 * @param {*} props:
 * required: fieldName: the name of the field
 *           fieldValue: the value of the field
 * @returns Info field and its value.
 */
function InfoField(props) {
  const { fieldName, fieldValue } = props;

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="center"
      marginRight={theme.spacing(1)}
      marginLeft={theme.spacing(1)}
    >
      <Typography
        fontSize="1.3rem"
        fontWeight={500}
        marginRight={theme.spacing(1)}
      >
        {fieldName}:
      </Typography>
      <Typography fontSize="1.3rem" fontWeight={400}>
        {fieldValue}
      </Typography>
    </Box>
  );
}

export default InfoField;
