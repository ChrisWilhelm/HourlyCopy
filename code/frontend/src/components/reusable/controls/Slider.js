import React from 'react';
import { Slider as MuiSlider } from '@mui/material';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';

/**
 * Represents a reusable component that is inspired by the Material UI Slider component.
 * @param {*} props:
 * required: name: the name of the component
 *           label: the label of the slider
 *           value: the state variable that holds the value of the slider
 *           onChange: function that handles what happens when value of slider
 *                     is changed
 *           options: list of menu options
 *           marks: list of marks that is displayed for the slider
 * optional: error: determines whether error helper text is displayed when invalid input
 *                  is provided
 *           width: the width of the dropdown component (default is 700px)
 *           margin: the margin of the dropdown component (default is 20px)
 *           defaultValue: the default value of the slider
 *           min: the minimum value of the slider
 *           max: the maximum value of the slider
 *           step: the spacing between values of the slider
 * @returns A reusable slider component.
 */
function Slider(props) {
  const {
    name,
    label,
    value,
    onChange,
    marks,
    error = null,
    width,
    margin,
    defaultValue,
    min,
    max,
    step,
    ...other
  } = props;

  const styles = {
    slider: {
      margin: margin || '20px',
      width: width || '700px',
    },
  };

  return (
    <FormControl sx={styles.slider} {...(error && { error: true })}>
      <Grid container direction="column" alignItems="center" spacing={4}>
        <Grid item>
          <InputLabel style={{ fontSize: '0.8rem', marginLeft: -16 }}>
            {label}
          </InputLabel>
        </Grid>
        <Grid item width="100%">
          <Box sx={{ width: width, justifyContent: 'center' }}>
            <MuiSlider
              name={name}
              value={value}
              onChange={onChange}
              defaultValue={defaultValue}
              min={min}
              max={max}
              step={step}
              marks={marks}
              {...other}
            />
          </Box>
        </Grid>
      </Grid>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default Slider;
