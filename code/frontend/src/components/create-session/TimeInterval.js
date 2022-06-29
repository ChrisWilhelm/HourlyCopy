import * as React from 'react';
import Controls from '../reusable/controls/Controls';

/**
 * Represents a Material UI Slider component that allows staff to select
 * the amount of time that they would like to meet with each student.
 * @param {*} props:
 * required: value: state variable that represents the value of the slider
 *           setValue: state function to set value of the slider
 * @returns A time interval slider.
 */
export default function TimeInterval(props) {
  const { value, setValue } = props;

  const marks = [
    {
      value: 5,
      label: '5 min',
    },
    {
      value: 10,
      label: '10 min',
    },
    {
      value: 15,
      label: '15 min',
    },
    {
      value: 20,
      label: '20 min',
    },
    {
      value: 25,
      label: '25 min',
    },
    {
      value: 30,
      label: '30 min',
    },
  ];

  const handleInputChange = (event, value) => {
    setValue(value);
  };

  return (
    <Controls.Slider
      name="timeInterval"
      label="Time Interval"
      margin="0px"
      width="100%"
      defaultValue={10}
      min={5}
      max={30}
      step={5}
      marks={marks}
      value={value}
      onChange={handleInputChange}
    />
  );
}
