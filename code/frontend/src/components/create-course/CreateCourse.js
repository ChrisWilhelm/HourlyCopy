import { Typography } from '@mui/material';
import CreateCourseForm from './CreateCourseForm';
import React from 'react';
import Popup from '../reusable/Popup';

/**
 * Parent component for the CreateCourseForm component.
 * @param {*} props:
 * required: token: user's token
 *           onClose: function that handles what happens wheb
 *                     popup is closed
 *           open: state variable that determines whether the
 *                 popup is open
 * @returns A component representing the "Create Course" popup.
 */
function CreateCourse(props) {
  const { token, onClose, open } = props;

  return (
    <Popup onClose={onClose} open={open}>
      <Typography variant="popup">Create Course</Typography>
      <CreateCourseForm token={token} onClose={onClose} />
    </Popup>
  );
}

export default CreateCourse;
