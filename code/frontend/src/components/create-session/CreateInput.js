import React from 'react';
import theme from '../../theme';
import Controls from '../reusable/controls/Controls';

/**
 * A InputText component that is utilized for the CreateSession component.
 * @param {*} props:
 * required: label: the label text
 *           name: the name of the component
 *           value: the value of the component
 *           handleInputChange: function that handles what happens
 *                              when value is changed
 *           error: allowed for error helper text to be displayed when
 *                  provided invalid input
 *           width: the width of the component
 * @returns A input field for the CreateSession component.
 */
export default function CreateInput(props) {
  const { label, name, value, onChange, error, width } = props;

  const type = (name) => {
    if (name === 'startTime' || name === 'endTime') {
      return 'time';
    } else if (name === 'startDate' || name === 'endDate') {
      return 'date';
    }
    return 'text';
  };

  return (
    <Controls.InputText
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      InputLabelProps={{ shrink: true }}
      type={type(name)}
      width={width}
      margin={theme.spacing(2)}
      fontSize="1.3rem"
      error={error}
    />
  );
}
