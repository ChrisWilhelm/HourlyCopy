import React from 'react';
import CreateCourse from '../create-course/CreateCourse';
import Controls from '../reusable/controls/Controls';

/**
 * Child component of the ViewCourses page that represents the Create
 * button and its corresponding popup.
 * @param {*} props:
 * required: token: user's token
 *           open: state function that handles whether the popup is
 *                 displayed
 *           setOpen: state function that handles whether the popup
 *                    is displayed
 * @returns The Create button and its popup.
 */
export default function CreateButton(props) {
  const { token, open, setOpen } = props;

  const onClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Create Button */}
      <Controls.Button
        text="Create"
        margin="0px"
        width="150px"
        fontSize="1.1rem"
        onClick={onClick}
      />
      {/* Create Popup */}
      <CreateCourse open={open} onClose={handleClose} token={token} />
    </>
  );
}
