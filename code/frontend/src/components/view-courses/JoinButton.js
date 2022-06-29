import React from 'react';
import JoinCourse from '../join-course/JoinCourse';
import Controls from '../reusable/controls/Controls';

/**
 * Child component of the ViewCourses page that represents the Join
 * button and its corresponding popup.
 * @param {*} props:
 * required: token: user's token
 *           open: state function that handles whether the popup is
 *                 displayed
 *           setOpen: state function that handles whether the popup
 *                    is displayed
 * @returns The Join button and its popup.
 */
export default function JoinButton(props) {
  const { token, open, setOpen } = props;

  const onClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Join Button */}
      <Controls.Button
        text="Join"
        margin="0px"
        width="150px"
        fontSize="1.1rem"
        onClick={onClick}
      />
      {/* Join Popup */}
      <JoinCourse open={open} onClose={handleClose} token={token} />
    </>
  );
}
