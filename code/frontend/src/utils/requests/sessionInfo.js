import axios from 'axios';
import { errorToast } from '../toast';
import { getAuthConfig } from './config';

// Request to check whether a student is registerd for a session
export const isRegistered = async (
  token,
  course,
  officeHour,
  setIsRegistered,
  setRegistration,
  cancel,
) => {
  try {
    const URL = `api/courses/${course.courseid}/officeHours/${
      officeHour.officehourid
    }/${new Date(officeHour.startdate)
      .toISOString()
      .substring(0, 10)}/isRegistered`;
    const response = await axios.get(URL, getAuthConfig(token));
    if (cancel) return;
    setIsRegistered(response.data.isRegistered);
    response.data.isRegistered && setRegistration(response.data.registration);
  } catch (error) {
    errorToast(error);
  }
};

// Request to get available time slots.
export const getRegistrationTimes = async (token, officeHour, setTimes) => {
  try {
    const URL = `api/courses/officeHours/${
      officeHour.officehourid
    }/times/${new Date(officeHour.startdate).toISOString().substring(0, 10)}`;
    const response = await axios.get(URL, getAuthConfig(token));
    setTimes(response.data.times);
  } catch (error) {
    errorToast(error);
  }
};

// Request to see whether student is on waitlist
export const getWaitlistStatus = async (
  token,
  course,
  officeHour,
  setOnWaitlist,
) => {
  const URL = `/api/courses/${course.courseid}/officeHours/${
    officeHour.officehourid
  }/${new Date(officeHour.startdate)
    .toISOString()
    .substring(0, 10)}/isOnWaitlist`;
  const config = {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    await axios.get(`${URL}`, config).then((result) => {
      setOnWaitlist(result.data.onWaitlist);
    });
  } catch (e) {
    errorToast(e);
  }
};

export const queueIsStarted = async (token, officeHour, setQueueStarted) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const URL = `api/courses/officeHours/${officeHour.officehourid}/${new Date(
      officeHour.startdate,
    )
      .toISOString()
      .substring(0, 10)}/queueStarted`;
    const response = await axios.get(URL, config);
    setQueueStarted(response.data.isStarted);
  } catch (error) {
    errorToast(error);
  }
};
