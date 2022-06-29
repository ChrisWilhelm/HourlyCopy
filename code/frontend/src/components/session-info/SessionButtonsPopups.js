import { useState } from 'react';
import SessionButtons from './SessionButtons';
import Summary from '../summary/Summary';
import { getLocaleTime } from '../../utils/helpers/helpers';
import { useNavigate } from 'react-router';
import Register from '../register/Register';
import axios from 'axios';
import { errorToast, successToast } from '../../utils/toast';
import ConfirmActionDialog from '../reusable/ConfirmActionDialog';
import { cancelOfficeHour } from '../../utils/requests/officeHours';
import { ongoing, upcoming } from '../../utils/helpers/sessionInfo';

/**
 * A Material UI inspired Dialog component that shares info about a session.
 * Students will be able to register and cancel registrations while course staff
 * will be able to see details and cancel sessions.
 * @param {*} props:
 * required: token: user's token
 *           view: student or staff view ("Student"/"Staff")
 *           officeHour: office hour object
 *           registered: boolean representing whether student is registered
 *                       for the session
 *           host: boolean representing whether user is a host of the session
 *           registration: registration object
 *           accountid: user's account id
 *           course: course object
 *           start: session's start time
 *           end: session's end time
 *           title: the title of the session
 *           onClose: function that is reponsible for what happens when
 *                    the SessionInfo popup is closed
 *           onWaitlist: boolean that represents whether a student
 *                       is on the waitlist
 *           queueStarted: boolean that represents whether queue has started
 * @returns The SessionInfo popup.
 */
export default function SessionButtonPopups(props) {
  const {
    token,
    view,
    officeHour,
    registered,
    host,
    registration,
    accountid,
    course,
    start,
    end,
    title,
    onClose,
    onWaitlist,
    queueStarted,
  } = props;

  const navigate = useNavigate();

  const [openSummary, setOpenSummary] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const handleCloseRegister = () => {
    onClose();
    setOpenRegister(false);
  };

  const handleCancel = async () => {
    const cancelUrl =
      view === 'Student'
        ? `/api/courses/officeHours/registrations/${registration.registrationid}/cancel`
        : `/api/courses/officehours/${officeHour.officehourid}/cancel`;
    await axios
      .post(
        cancelUrl,
        view === 'Staff' ? { date: officeHour.startdate } : null,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((res) => {
        onClose();
        successToast('Successfully cancelled');
      })
      .catch((err) => {
        errorToast(err);
      });
  };

  const handleCancelRecurring = async (option) => {
    await cancelOfficeHour(
      officeHour.officehourid,
      option,
      new Date(officeHour.startdate).toISOString().substring(0, 10),
      token,
    )
      .then(() => {
        onClose();
        successToast('Session successfully cancelled');
      })
      .catch((err) => {
        errorToast(err);
      });
  };

  const handleOpenQueue = () => {
    navigate('/queue', {
      state: {
        role: view === 'Student' ? 'student' : 'host',
        id: officeHour.officehourid,
        date: new Date(officeHour.startdate),
        accountid: accountid,
        course: course,
      },
    });
  };

  return (
    <>
      <SessionButtons
        view={view}
        seeDetails={() => setOpenSummary(true)}
        setOpenCancel={setOpenCancel}
        setOpenRegister={setOpenRegister}
        host={host}
        upcoming={upcoming(view, officeHour)}
        registered={registered}
        ongoing={ongoing(officeHour)}
        handleOpenQueue={handleOpenQueue}
        onWaitlist={onWaitlist}
      />
      <Register
        onClose={handleCloseRegister}
        course={course}
        open={openRegister}
        token={token}
        officeHour={officeHour}
        start={start}
        end={end}
        title={title}
        accountid={accountid}
        queueStarted={queueStarted}
      />
      <Summary
        onClose={() => setOpenSummary(false)}
        open={openSummary}
        officeHourId={officeHour.officehourid}
        date={new Date(officeHour.startdate).toISOString().split('T')[0]}
        startTime={getLocaleTime(officeHour.starttime)}
        endTime={getLocaleTime(officeHour.endtime)}
        token={token}
      />
      <ConfirmActionDialog
        dialogContentText={`Delete ${
          view === 'Staff'
            ? 'recurring office hours'
            : `registration for ${title} on ${new Date(officeHour.startdate)
                .toString()
                .substring(0, 16)}`
        }`}
        dialogActionText="Confirm Cancellation"
        handleAction={view === 'Staff' ? handleCancelRecurring : handleCancel}
        open={openCancel}
        setOpen={setOpenCancel}
        options={
          view === 'Staff' && [
            { value: 'this', label: 'This event' },
            { value: 'following', label: 'This and following events' },
            { value: 'all', label: 'All events' },
          ]
        }
      />
    </>
  );
}
