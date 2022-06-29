import React from 'react';
import { Typography } from '@mui/material';
import theme from '../../theme';

/**
 * Child component that displays a student's status
 * for an office hour session.
 * @param {*} props:
 * required: registered: boolean that signifies whether
 *                       a student is registered for a
 *                       session
 *           waitlist: boolean that signfifies whether
 *                     a student is on the waitlist
 * @returns A text illustrating a student's status for a
 * a session.
 */
export default function SessionStatus(props) {
  const { registered, waitlist } = props;

  return waitlist ? (
    <Typography marginBottom={theme.spacing(2)} color={'primary'}>
      You are currently on the waitlist for this session
    </Typography>
  ) : (
    <Typography
      marginBottom={theme.spacing(2)}
      color={registered ? 'green' : 'secondary'}
    >
      {registered
        ? 'You are currently registered for this session'
        : 'You are not registered for this session'}
    </Typography>
  );
}
