import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  fetchAndSetRowsTable,
  getColumns,
} from '../../utils/helpers/analytics';

/**
 * A component inspired by the Material UI DataGrid component that reveals
 * statistics about the course.
 * @param {*} props - Properties include token and course
 * @returns A table regarding registration statistics.
 */
export default function AnalyticsTable(props) {
  const { token, course, option } = props;
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    setColumns(getColumns(option));
  }, [option]);

  useEffect(() => {
    fetchAndSetRowsTable(token, option, course, setRows);
  }, [token, course, option]);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      disableColumnSelector
      disableSelectionOnClick
      sx={{ fontSize: { xs: '0.7rem', sm: '1rem', md: '1.4rem' } }}
      autoHeight
    />
  );
}
