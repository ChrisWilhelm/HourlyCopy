import Controls from '../reusable/controls/Controls';

/**
 * Buttons for the SessionInfo component.
 * @param {*} props:
 * required: view: student view or staff view ("Student"/"Staff")
 *           seeDetails: function that opens Summary popup
 *           setOpenCancel: state function that sets openCancel to
 *                          true/false
 *           host: boolean that represents whether user is a host
 *                 of a session
 *           upcoming: boolean that represents whether a session
 *                     upcoming
 *           ongoing: boolean that represents whether a session
 *                    is ongoing
 *           registered: boolean that represents whether a student
 *                       is registered for a session
 *           onWaitlist: boolean that represents whether a student
 *                       is on the waitlist
 *           setOpenRegister: state function that sets openRegister
 *                            to true/false
 *           handleOpenQueue: function that navigates to the ViewQueue
 *                            page:
 * @returns Conditional buttons for the SessionInfo component.
 */
export default function SessionButtons(props) {
  const {
    view,
    seeDetails,
    setOpenCancel,
    host,
    upcoming,
    ongoing,
    registered,
    onWaitlist,
    setOpenRegister,
    handleOpenQueue,
  } = props;

  return (
    <>
      {view === 'Staff' && host && (
        <Controls.Button
          text="See Details"
          onClick={seeDetails}
          fontSize="1.1rem"
        />
      )}
      {view === 'Student' &&
        (upcoming || ongoing) &&
        !registered &&
        !onWaitlist && (
          <Controls.Button
            text="Sign Up"
            onClick={() => setOpenRegister(true)}
            fontSize="1.1rem"
          />
        )}
      {(host || view === 'Student') && ongoing && (
        <Controls.Button
          text="View Queue"
          onClick={handleOpenQueue}
          fontSize="1.1rem"
        />
      )}
      {(host || registered) && upcoming && (
        <Controls.Button
          text="Cancel"
          onClick={() => setOpenCancel(true)}
          color="secondary"
          fontSize="1.1rem"
        />
      )}
    </>
  );
}
