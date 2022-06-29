import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import * as React from 'react';

/**
 * A component that is inspired by the Material UI RadioGroup component.
 * @param {*} props:
 * required: option: state varaible that represents current data view
 *           topicIV: state variable that represents topic independent var
 *           sessionIV: state variable that represents topic independent var
 *           handleChange: function that handles what happens when radio group
 *                         value has changed
 * @returns A radio group that is used to switch the view of the graph.
 */
export default function AnalyticsRadioGroup(props) {
  const { option, topicIV, sessionIV, handleChange } = props;

  const sessionIVars = [
    { value: 'times', label: 'Time Period' },
    { value: 'hosts', label: 'Host' },
  ];

  const topicIVars = [
    { value: 'bar', label: 'Bar' },
    { value: 'radar', label: 'Radar' },
  ];

  return (
    <FormControl>
      <RadioGroup
        row
        value={option === 'Topics' ? topicIV : sessionIV}
        onChange={handleChange}
      >
        {option === 'Topics'
          ? topicIVars.map((pair) => (
              <FormControlLabel
                value={pair.value}
                control={<Radio />}
                label={pair.label}
              />
            ))
          : sessionIVars.map((pair) => (
              <FormControlLabel
                value={pair.value}
                control={<Radio />}
                label={pair.label}
              />
            ))}
      </RadioGroup>
    </FormControl>
  );
}
