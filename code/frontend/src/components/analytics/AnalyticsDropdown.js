import React from 'react';
import Controls from '../reusable/controls/Controls';

/**
 * A child component for Analytics page that represents the mui Select
 * component that is used to switch between different views of data.
 * @param {*} props:
 * required: option: state variable that represents the data option
 *           handleOptionChange: function that handles what happens
 *                               when option is changed
 * @returns A dropdown component for Analytics page.
 */
export default function AnalyticsDropdown(props) {
  const { option, handleOptionChange } = props;

  // User can select between different table options
  const options = [
    { id: '1', title: 'Topics' },
    { id: '2', title: 'Students' },
    { id: '3', title: 'Sessions' },
  ];

  return (
    <Controls.Dropdown
      options={options}
      value={option}
      onChange={handleOptionChange}
      fontSize={{ xs: '1rem', sm: '1rem', md: '1.3rem' }}
      defaultValue={options[0].title}
      width={{ xs: '100px', sm: '100px', md: '150px' }}
      height={{ xs: '35px', sm: '35px', md: '50px' }}
      margin="0px 0px 0px 10px"
    />
  );
}
