import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Details from './Details';
import Popup from '../reusable/Popup';
import SessionStatus from './SessionStatus';
import SessionButtonPopups from './SessionButtonsPopups';
import {
  ongoing,
  sessionInfoHelper,
  upcoming,
} from '../../utils/helpers/sessionInfo';

/**
 * A Material UI inspired Dialog component that shares info about a session.
 * Students will be able to register and cancel registrations while course staff
 * will be able to see details and cancel sessions.
 * @param {*} props:
 * required: open: state variable that handles whether the SessionInfo popup is
 *                 active
 *           onClose: function that is reponsible for what happens when
 *                    the SessionInfo popup is closed
 *           view: student or staff view ("Student"/"Staff")
 *           title: the title of the session
 *           officeHour: office hour object
 *           token: user's token
 *           start: session's start time
 *           end: session's end time
 *           course: course object
 *           accountid: user's account id
 * @returns The SessionInfo popup.
 */
function SessionInfo(props) {
  const {
    open,
    onClose,
    view,
    title,
    officeHour,
    token,
    start,
    end,
    course,
    accountid,
  } = props;

  const [host, setHost] = useState(false);
  const [registered, setIsRegistered] = useState(false);
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [queueStarted, setQueueStarted] = useState(false);
  const [registration, setRegistration] = useState({});
  const [times, setTimes] = useState([]);

  useEffect(() => {
    let cancel = false;

    sessionInfoHelper(
      token,
      view,
      officeHour,
      course,
      setIsRegistered,
      setRegistration,
      setTimes,
      setHost,
      setOnWaitlist,
      setQueueStarted,
      cancel,
    );

    return () => {
      cancel = true;
    };
  }, [token, course, officeHour, view]);

  return (
    <>
      <Popup open={open} onClose={onClose}>
        <Details
          title={title}
          officeHour={officeHour}
          spots={times.length}
          view={view}
          upcoming={upcoming(view, officeHour)}
        />
        {view === 'Student' &&
          (upcoming(view, officeHour) || ongoing(officeHour)) && (
            <SessionStatus registered={registered} waitlist={onWaitlist} />
          )}
        <SessionButtonPopups
          token={token}
          view={view}
          officeHour={officeHour}
          registered={registered}
          host={host}
          registration={registration}
          accountid={accountid}
          course={course}
          start={start}
          end={end}
          title={title}
          onClose={onClose}
          onWaitlist={onWaitlist}
          queueStarted={queueStarted}
        />
      </Popup>
    </>
  );
}

export default SessionInfo;
