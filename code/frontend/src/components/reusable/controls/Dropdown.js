import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

/**
 * Represents a reusable component that is inspired by the Material UI Select component.
 * @param {*} props:
 * required: name: the name of the component
 *           label: the label of the dropdown
 *           value: the state variable that holds the value of the dropdown
 *           onChange: function that handles what happens when value of dropdown
 *                     is changed
 *           options: list of menu options
 * optional: idOrTitle: value should be either "id" or "title". Determines whether
 *                      the id or title should be displayed as the menu items/options.
 *                      Default is "title"
 *           error: determines whether error helper text is displayed when invalid input
 *                   is provided
 *           width: the width of the dropdown component (default is 50vw)
 *           height: the height of the dropdown component
 *           margin: the margin of the dropdown component (default is 20px)
 *           fontSize: the font size of the text (default is 1.3rem)
 * @returns A reusable dropdown component.
 */
function Dropdown(props) {
  const {
    name,
    label,
    value,
    onChange,
    options,
    idOrTitle = 'title',
    error = null,
    width,
    height,
    margin,
    fontSize,
    ...other
  } = props;

  const styles = {
    dropdown: {
      margin: margin || '20px',
      width: width || '50vw',
    },
  };

  return (
    <FormControl
      variant="outlined"
      sx={styles.dropdown}
      {...(error && { error: true })}
    >
      <InputLabel sx={{ fontSize: fontSize || '1.3rem' }}>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        sx={{
          fontSize: fontSize || '1.3rem',
          paddingTop: '0.2vh',
          height: height,
        }}
        {...other}
      >
        {options.map((item) => (
          <MenuItem
            key={item.id}
            value={idOrTitle === 'id' ? item.id : item.title}
            sx={{ fontSize: fontSize || '1.3rem' }}
          >
            {item.title}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default Dropdown;
