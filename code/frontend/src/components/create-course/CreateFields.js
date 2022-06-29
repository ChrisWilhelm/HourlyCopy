import React from 'react';
import { getSemesterCollection } from '../../utils/helpers/helpers';
import Controls from '../reusable/controls/Controls';

/**
 * Child component that represents the fields of the CreateCourseForm
 * component.
 * @param {*} props:
 * required: values: object containing the fields required to create a course
 *           handleInputChange: function that handles when each of the input
 *                              field changes
 *           errors: object that helps determines whether error helper text
 *                   needs to be displayed for an invalid field
 * @returns CreateCourseForm input fields.
 */
export default function CreateFields(props) {
  const { values, handleInputChange, errors } = props;

  return (
    <>
      <Controls.InputText
        label="Course Title"
        name="title"
        value={values.title}
        onChange={handleInputChange}
        error={errors.title}
        width="50vw"
        fontSize="1.2rem"
      />
      <Controls.InputText
        label="Course Number"
        name="number"
        value={values.number}
        onChange={handleInputChange}
        error={errors.number}
        width="50vw"
        fontSize="1.2rem"
      />
      <Controls.Dropdown
        label="Semester"
        name="semester"
        value={values.semester}
        onChange={handleInputChange}
        options={getSemesterCollection()}
        width="50vw"
        error={errors.semester}
        fontSize="1.2rem"
      />
      <Controls.InputText
        label="Year"
        name="year"
        value={values.year}
        onChange={handleInputChange}
        error={errors.year}
        width="50vw"
        fontSize="1.2rem"
      />
    </>
  );
}
