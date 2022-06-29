import {
  FormControlLabel,
  FormGroup,
  Checkbox as MuiCheckbox,
} from '@mui/material';
import React from 'react';

/**
 * Represents a reusable component that is inspired by the Material UI Checkbox component.
 * @param {*} props:
 * required: label: the label of the component
 *           value: the value of the checkbox
 *           onChange: function that handles what happens when value is changed
 * @returns A reusable checkbox component.
 */
export default function Checkbox(props) {
  const { label, value, onChange } = props;

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <MuiCheckbox
            defaultChecked={value}
            color="primary"
            onChange={onChange}
          />
        }
        label={label}
      />
    </FormGroup>
  );
}
