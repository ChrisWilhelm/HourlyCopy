import axios from 'axios';
import { errorToast } from '../toast';
import { getAuthConfig } from './config';

export const fetchCourses = async (
  token,
  setStudentCourses,
  setStaffCourses,
) => {
  await axios
    .get('/api/users/me/courses', getAuthConfig(token))
    .then(function (response) {
      const studentCourses = response.data.courses.asStudent;

      for (let i = 0; i < studentCourses.length; i++) {
        studentCourses[i]['view'] = 'Student';
      }

      const staffCourses = response.data.courses.asStaff;

      for (let j = 0; j < staffCourses.length; j++) {
        staffCourses[j]['view'] = 'Staff';
      }

      setStudentCourses(studentCourses);
      setStaffCourses(staffCourses);
    })
    .catch(function (err) {
      errorToast(err);
    });
};
