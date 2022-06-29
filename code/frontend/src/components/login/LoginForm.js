import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Controls from '../reusable/controls/Controls';
import { Form, useForm } from '../reusable/Form';
import validator from 'validator';
import { errorToast } from '../../utils/toast';

/**
 * A component that represents the form that users fill out to login to app.
 * @param {*} props - Properties include setAuth and setToken.
 * @returns A login form component.
 */
function LoginForm(props) {
  const { setAuth, setToken } = props;
  const navigate = useNavigate();

  const initialCreds = {
    email: '',
    password: '',
  };

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('email' in fields)
      temp.email = validator.isEmail(fields.email)
        ? ''
        : 'Please include a valid email';
    if ('password' in fields)
      temp.password =
        fields.password.length !== 0 ? '' : 'Password is required';

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const { values, errors, setErrors, handleInputChange } =
    useForm(initialCreds);

  const fetchUser = async (email, password) => {
    try {
      const response = await axios.post('/api/users/login', {
        email: email,
        password: password,
      });
      const data = response.data;
      if (data.token !== undefined) {
        setAuth(true);
        setToken(data.token.toString());
        navigate('/courses', { state: { course: { title: '', code: '' } } });
      }
    } catch (err) {
      errorToast(err);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      fetchUser(values.email, values.password);
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
          <Controls.InputText
            label="Email"
            name="email"
            value={values.email}
            onChange={handleInputChange}
            error={errors.email}
            width="700px"
          />
        </Grid>
        <Grid item md="auto">
          <Controls.InputText
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
          <Controls.Button
            text="Login"
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
            <Typography>Don't have an account?</Typography>
          </Grid>
          <Grid item md="auto">
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Typography color="primary" sx={{ fontWeight: 500 }}>
                Sign Up!
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
}

export default LoginForm;
