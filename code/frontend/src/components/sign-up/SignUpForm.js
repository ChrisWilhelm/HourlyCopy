import { Grid, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import { Form, useForm } from '../reusable/Form';
import InputText from '../reusable/controls/InputText';
import Controls from '../reusable/controls/Controls';
import validator from 'validator';
import { errorToast, successToast } from '../../utils/toast';

/**
 * A component that represents the form that users fill out to create an
 * an account.
 * @param {*} props - Properties include setAuth and setToken.
 * @returns A sign up form component.
 */
function SignUpForm(props) {
  const { setAuth, setToken } = props;
  const navigate = useNavigate();
  const URL = '/api/users/signup';

  const initialFields = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  };

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('name' in fields)
      temp.name = fields.name.length !== 0 ? '' : 'Name is required';
    if ('email' in fields)
      temp.email = validator.isEmail(fields.email)
        ? ''
        : 'Please include a valid email';
    if ('phoneNumber' in fields)
      temp.phoneNumber =
        validator.isMobilePhone(
          fields.phoneNumber
            .replace('(', '')
            .replace(')', '')
            .replace('-', '')
            .replace(/\s/g, ''), // TODO: Make this cleaner
        ) || fields.phoneNumber.length === 0
          ? ''
          : 'Please include a valid phone number';
    if ('password' in fields)
      temp.password =
        fields.password.length > 7
          ? ''
          : 'Please enter a password with 8 or more characters';
    if ('confirmPassword' in fields)
      temp.confirmPassword =
        fields.confirmPassword === fields.password
          ? ''
          : 'Please make sure your passwords match';

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const { values, errors, setErrors, handleInputChange } =
    useForm(initialFields);

  const signUp = async () => {
    try {
      const response = await axios.post(`${URL}`, {
        email: values.email,
        password: values.password,
        name: values.name,
        ...(values.phoneNumber.length !== 0 && {
          phoneNumber: values.phoneNumber,
        }),
      });
      const data = response.data;
      if (data.token !== undefined) {
        setAuth(true);
        setToken(data.token.toString());
        successToast('Successfully created account!');
        navigate('/courses', { state: { course: { title: '', code: '' } } });
      }
      return data;
    } catch (err) {
      errorToast(err);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      signUp();
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Grid
        container
        direction={'column'}
        alignItems="center"
        justifyContent="center"
      >
        <Grid item md="auto">
          <InputText
            label="Name"
            name="name"
            value={values.name}
            onChange={handleInputChange}
            error={errors.name}
            width="700px"
          />
        </Grid>
        <Grid item md="auto">
          <InputText
            label="Email"
            name="email"
            value={values.email}
            onChange={handleInputChange}
            error={errors.email}
            width="700px"
          />
        </Grid>
        <Grid item md="auto">
          <InputText
            label="Phone Number"
            name="phoneNumber"
            value={values.phoneNumber}
            onChange={handleInputChange}
            error={errors.phoneNumber}
            type="tel"
            width="700px"
          />
        </Grid>
        <Grid item md="auto">
          <InputText
            label="Password"
            name="password"
            value={values.password}
            onChange={handleInputChange}
            error={errors.password}
            type="password"
            width="700px"
          />
        </Grid>
        <Grid item md="auto">
          <InputText
            label="Confirm Password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            type="password"
            width="700px"
          />
        </Grid>
        <Grid item md="auto">
          <Controls.Button
            text="Sign Up"
            type="submit"
            width="300px"
            fontSize="17px"
          />
        </Grid>
        <Grid
          container
          direction={'row'}
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <Grid item md="auto">
            <Typography>Already have an account?</Typography>
          </Grid>
          <Grid item md="auto">
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography color="primary" sx={{ fontWeight: 500 }}>
                Login!
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
}

export default SignUpForm;
