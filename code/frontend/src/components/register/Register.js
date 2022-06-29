import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import RegisterForm from './RegisterForm';

/**
 * Parent component for the RegisterForm component.
 * @param {*} props - Properties include onClose, open, token,
 * officeHour, start, end, and title.
 * @returns A component representing the sign up for a session popup.
 */
function Register(props) {
  const {
    onClose,
    open,
    token,
    officeHour,
    start,
    end,
    title,
    course,
    accountid,
    queueStarted,
  } = props;

  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        disableEnforceFocus
        PaperProps={{
          sx: {
            width: '50%',
            maxHeight: 800,
          },
        }}
      >
        <RegisterForm
          onClose={onClose}
          course={course}
          title={title}
          officeHour={officeHour}
          open={open}
          token={token}
          start={start}
          end={end}
          queueStarted={queueStarted}
          accountid={accountid}
        />
      </Dialog>
    </div>
  );
}

export default Register;
