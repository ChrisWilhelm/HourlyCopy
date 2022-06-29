import { Typography, Box } from '@mui/material';
import { List } from '@mui/material';
import { useState, useEffect } from 'react';
import SummaryItem from './SummaryItem';
import Popup from '../reusable/Popup';
import theme from '../../theme';
import { fetchRegistrations } from '../../utils/requests/summary';

/**
 * Represents a Material UI Dialog component that allows a host to see details about their office
 * hour session.
 * @param {*} props:
 * required: token: user's token
 *           onClose: function that handles what happens when popup is closed
 *           open: state variable that handles whether the popup is active
 *           officeHourId: office hour id
 *           date: the date of the session
 *           startTime: the start time of the session
 *           endTime: the end time of the session
 * @returns A popup for viewing details about an office hour session.
 */
export default function Summary(props) {
  const { token, onClose, open, officeHourId, date, startTime, endTime } =
    props;

  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    open && fetchRegistrations(token, officeHourId, date, setRegistrations);
  }, [open, date, officeHourId, token]);

  return (
    <Popup open={open} onClose={onClose}>
      <Typography fontSize="1.6rem" fontWeight={600} textAlign="center">
        Summary for Office Hours on
        <br />
        {new Date(`${date}T12:00:00`).toDateString()}
        <br />
        from {startTime} to {endTime}
      </Typography>
      <Box flex={1} display="flex" width="100%" justifyContent="center">
        {registrations.length > 0 ? (
          <List sx={{ width: '100%' }}>
            {registrations.map((registration, index) => {
              return <SummaryItem registration={registration} index={index} />;
            })}
          </List>
        ) : (
          <Typography variant="no-data" margin={theme.spacing(3)}>
            No Registrations
          </Typography>
        )}
      </Box>
    </Popup>
  );
}
