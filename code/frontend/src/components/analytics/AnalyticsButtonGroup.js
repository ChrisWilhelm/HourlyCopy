import { ButtonGroup } from '@mui/material';
import React, { useState } from 'react';
import Controls from '../reusable/controls/Controls';

/**
 * A child component for Analytics page that represents the mui button group
 * component that is used to switch between graph and table view.
 * @param {*} props:
 * required: setIsTable: state function that is used to set the table
 *                       view to active
 * @returns A ButtonGroup component for Analytics page.
 */
export default function AnalyticsButtonGroup(props) {
  const { setIsTable } = props;

  const [tableColor, setTableColor] = useState('primary');
  const [graphColor, setGraphColor] = useState('white');
  const [tableTextColor, setTableTextColor] = useState('white');
  const [graphTextColor, setGraphTextColor] = useState('primary.main');

  const selectTable = () => {
    setIsTable(true);
    setTableColor('primary');
    setTableTextColor('white');
    setGraphColor('white');
    setGraphTextColor('primary.main');
  };

  const selectGraph = () => {
    setIsTable(false);
    setTableColor('white');
    setTableTextColor('primary.main');
    setGraphColor('primary');
    setGraphTextColor('white');
  };

  return (
    <ButtonGroup variant="contained">
      <Controls.Button
        text="Table"
        margin="0%"
        sx={{
          backgroundColor: tableColor,
          color: tableTextColor,
          fontSize: { xs: '0.8rem', sm: '0.8rem', md: '1rem' },
        }}
        width="50%"
        onClick={selectTable}
      />
      <Controls.Button
        text="Graph"
        margin="0%"
        width="50%"
        sx={{
          backgroundColor: graphColor,
          color: graphTextColor,
          fontSize: { xs: '0.8rem', sm: '0.8rem', md: '1rem' },
        }}
        onClick={selectGraph}
      />
    </ButtonGroup>
  );
}
