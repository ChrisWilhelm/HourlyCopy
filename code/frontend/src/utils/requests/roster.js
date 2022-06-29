import { errorToast } from '../toast';
import axios from 'axios';

export const fetchUsers = async (id, token, callback) => {
  const courseid = id;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const URL = `/api/courses/${courseid}/getRoster`;

    const data = await axios.get(URL, config);
    callback(data.data);
  } catch (error) {
    errorToast(error);
  }
};
