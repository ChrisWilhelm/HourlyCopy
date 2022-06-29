import axios from 'axios';
import { successToast, errorToast } from '../toast';
import { getAuthConfig } from './config';

export const createCourse = async (token, values, onClose) => {
  await axios
    .post(
      '/api/courses',
      {
        title: values.title,
        number: values.number,
        semester: values.semester,
        year: parseInt(values.year),
      },
      getAuthConfig(token),
    )
    .then(function (response) {
      successToast(
        `Successfully created ${values.title} course. Invite users using this
        code: ${response.data.course.code}`,
      );
      onClose();
    })
    .catch(function (err) {
      errorToast(err);
    });
};
