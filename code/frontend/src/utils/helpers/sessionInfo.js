import {
  getRegistrationTimes,
  getWaitlistStatus,
  isRegistered,
  queueIsStarted,
} from '../requests/sessionInfo';
import { getMe } from '../requests/users';
import { errorToast } from '../toast';
import { getTimeInMS } from './helpers';

// Helper function to retrieve information from backend for SessionInfo component.
export function sessionInfoHelper(
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
) {
  getRegistrationTimes(token, officeHour, setTimes);
  view === 'Staff'
    ? getMe(token)
        .then(function (response) {
          if (cancel) return;
          setHost(officeHour.hostid.includes(response.data.accountid));
        })
        .catch(function (err) {
          errorToast(err);
        })
    : isRegistered(
        token,
        course,
        officeHour,
        setIsRegistered,
        setRegistration,
        cancel,
      ) &&
      getWaitlistStatus(token, course, officeHour, setOnWaitlist) &&
      queueIsStarted(token, officeHour, setQueueStarted); // queueIsStarted only needed to redirect students who sign up for waitlist
}

export const getStartDateAdjustedWithHours = (officeHour) => {
  const dateObj = new Date(officeHour.startdate);
  const start = new Date(dateObj.getTime() + getTimeInMS(officeHour.starttime));
  return start;
};

const getEndDateAdjustedWithHours = (officeHour) => {
  const dateObj = new Date(officeHour.startdate);
  const end = new Date(dateObj.getTime() + getTimeInMS(officeHour.endtime));
  return end;
};

// Helper function to see whether a session is upcoming
export const upcoming = (view, officeHour) => {
  const now = new Date();
  const date =
    view === 'Staff'
      ? getStartDateAdjustedWithHours(officeHour)
      : getEndDateAdjustedWithHours(officeHour);
  if (date.getTime() <= now.getTime()) {
    return false;
  } else {
    return true;
  }
};

// Helper function to see whether a function is ongoing
export const ongoing = (officeHour) => {
  const now = new Date();
  const startTime = getStartDateAdjustedWithHours(officeHour);
  const endTime = getEndDateAdjustedWithHours(officeHour);
  if (
    startTime.getTime() <= now.getTime() &&
    endTime.getTime() >= now.getTime()
  ) {
    return true;
  } else {
    return false;
  }
};
