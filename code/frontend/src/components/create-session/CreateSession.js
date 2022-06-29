import { Typography } from '@mui/material';
import React from 'react';
import CreateSessionForm from './CreateSessionForm';
import Popup from '../reusable/Popup';
import theme from '../../theme';

/**
 * Parent component for the CreateSessionForm component.
 * @param {*} props:
 * required: token: user's token
 *           onClose: function that handles what happens wheb
 *                     popup is closed
 *           open: state variable that determines whether the
 *                 popup is open
 *           selectedDays: state variable that represents the
 *                         the selected days
 *           setSelectedDays: state function that handles the
 *                            selection of days
 *           courseId: id of a course
 * @returns A component representing the "Create Course" popup.
 */
function CreateSession(props) {
  const { token, onClose, open, selectedDays, setSelectedDays, courseId } =
    props;

  return (
    <Popup open={open} onClose={onClose}>
      <Typography
        variant="popup"
        textAlign="center"
        marginBottom={theme.spacing(1)}
      >
        Create Session
      </Typography>
      <CreateSessionForm
        token={token}
        courseId={courseId}
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
        onClose={onClose}
      />
    </Popup>
  );
}

export default CreateSession;
