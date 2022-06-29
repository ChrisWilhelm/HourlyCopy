import axios from 'axios';
import { errorToast } from '../toast';
import { getAuthConfig } from './config';

// Request to get the registrations/questions for a session
export const fetchRegistrations = async (
  token,
  officeHourId,
  date,
  setRegistrations,
) => {
  try {
    const URL = `/api/courses/officeHours/${officeHourId}/${date}/questions`;
    const response = await axios.get(URL, getAuthConfig(token));
    setRegistrations(response.data.questions);
  } catch (error) {
    errorToast(error);
  }
};
