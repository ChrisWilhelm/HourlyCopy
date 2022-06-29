import { TextField } from '@mui/material';
import React from 'react';

/**
 * Represents a reusable component that is inspired by the Material UI TextField component.
 * @param {*} props:
 * required: name: the name of the component
 *           label: the label of the text field
 *           value: the state variable that holds the value of the text field
 *           onChange: function that handles what happens when value of text field
 *                     is changed
 * optional: error: determines whether error helper text is displayed when invalid input
 *                   is provided
 *           width: the width of the dropdown component (default is 700px)
 *           fontSize: the font size of the text (default is 20px)
 *           fontColor: the color of the text
 *           margin: the margin of the dropdown component (default is 20px)
 * @returns A reusable text field component.
 */
function InputText(props) {
  const {
    name,
    label,
    value,
    onChange,
    error = null,
    width,
    fontSize,
    fontColor,
    margin,
    ...other
  } = props;

  const styles = {
    input: {
      width: width || '700px',
      margin: margin || '20px',
    },
  };

  return (
    <TextField
      variant="outlined"
      label={label}
      name={name}
      value={value}
      style={styles.input}
      onChange={onChange}
      InputProps={{
        style: {
          fontSize: fontSize || '1.3vw',
          color: fontColor || 'black',
          paddingTop: '0.2vh',
        },
      }}
      InputLabelProps={{
        style: { fontSize: fontSize || '1.3vw' },
      }}
      {...(error && { error: true, helperText: error })}
      {...other}
    />
  );
}

export default InputText;
