import axios from 'axios';

export const cancelOfficeHour = async (id, option, date, token) => {
  if (option === 'all') {
    return await axios.delete(`/api/courses/officeHours/${id}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  return await axios.delete(
    `/api/courses/officeHours/${id}/${date}/${option}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};
