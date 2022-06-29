import { Grid, Container, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { getDate } from '../utils/helpers/helpers';

// Styled grid that grows row height dynamically with text
const DynamicDataGrid = styled(DataGrid)`
  .MuiDataGrid-viewport,
  .MuiDataGrid-row,
  .MuiDataGrid-renderingZone {
    max-height: fit-content !important;
  }

  .MuiDataGrid-cell {
    max-height: fit-content !important;
    overflow: auto;
    white-space: initial !important;
    line-height: 22px !important;
    display: flex !important;
    align-items: center;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
`;

// Get the feedback for a given office hour course
const getFeedback = async (courseid, token, setFeedback) => {
  try {
    const res = await axios.get(
      `/api/courses/${courseid}/officeHours/feedback`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setFeedback(res.data.feedback);
  } catch (error) {
    console.log(error);
  }
};

const columns = [
  {
    field: 'date',
    headerName: 'OH Date',
    flex: 3,
    type: 'dateTime',
  },
  {
    field: 'accountName',
    headerName: 'Username',
    flex: 3,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 3,
  },
  {
    field: 'feedback',
    headerName: 'Feedback',
    flex: 12,
  },
];

export default function Feedback(props) {
  const { token } = props;
  const location = useLocation();
  const course = location.state.course;
  // feedback: [{feedback, accountid, accountname, accountemail, officehourid, ohdate}]
  const [feedback, setFeedback] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getFeedback(course.courseid, token, setFeedback);
  }, [token, course.courseid]);

  // Set the rows to something nice once we get the feedback
  useEffect(() => {
    setRows(
      feedback.map(({ accountname, accountemail, ohdate, feedback }, id) => {
        return {
          id,
          accountName: accountname,
          email: accountemail,
          date: getDate(ohdate).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          feedback,
        };
      }),
    );
  }, [feedback]);

  return (
    <Container disableGutters sx={{ pl: 12, pr: 4, minWidth: '100%' }}>
      <Grid container direction="row">
        <Grid item sx={{ marginTop: 2, marginBottom: 2 }}>
          <Typography variant="header">Feedback</Typography>
        </Grid>
      </Grid>
      <div style={{ height: 600, width: '100%' }}>
        <DynamicDataGrid
          rows={rows}
          columns={columns}
          autoPageSize
          sx={{ fontSize: '20px' }}
        />
      </div>
    </Container>
  );
}
