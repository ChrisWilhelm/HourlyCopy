import Controls from '../reusable/controls/Controls';
import { useForm, Form } from '../reusable/Form';
import { Box } from '@mui/material';
import { isSemesterBeforeNow } from '../../utils/helpers/helpers';
import { createCourse } from '../../utils/requests/createCourse';
import CreateFields from './CreateFields';

/**
 * A component that represents the form that users can fill out to create a course.
 * @param {*} props:
 * required: token: user's token
 *           onClose: function that handles what happens when the popup is closed
 * @returns A create course form component.
 */
function CreateCourseForm(props) {
  const { token, onClose } = props;

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('title' in fields)
      temp.title = fields.title ? '' : 'This field is required.';

    if ('number' in fields)
      temp.number = /^\d{3}\..{3}$/.test(fields.number)
        ? ''
        : 'Course number is not valid. Must be xxx.xxx';

    if ('semester' in fields) {
      if (fields.semester.length === 0) {
        temp.semester = 'This field is required.';
      } else if (!isSemesterBeforeNow(fields.semester, values.year)) {
        temp.semester = 'Cannot create a course for a past semester.';
      } else {
        temp.semester = '';
      }
    }

    if ('year' in fields) {
      if (fields.year.length !== 4) {
        temp.year = 'Year must be 4 digits.';
      } else if (parseInt(fields.year) < new Date().getFullYear()) {
        temp.year = 'Year must be either the current or a future year.';
      } else {
        temp.year = '';
      }
    }

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const initialFValues = {
    title: '',
    number: '',
    semester: '',
    year: '',
  };

  const { values, errors, setErrors, handleInputChange } = useForm(
    initialFValues,
    false,
    validate,
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      createCourse(token, values, onClose);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Box flex={1} display="flex" flexDirection="column" alignItems="center">
        <CreateFields
          values={values}
          handleInputChange={handleInputChange}
          errors={errors}
        />
        <Controls.Button
          width="150px"
          fontSize="1.1rem"
          text="Create"
          type="submit"
        />
      </Box>
    </Form>
  );
}

export default CreateCourseForm;
