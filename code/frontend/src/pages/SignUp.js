import { Grid } from '@mui/material';
import Header from '../components/reusable/Header';
import SignUpForm from '../components/sign-up/SignUpForm';
import { useEffect } from 'react';

/**
 * Parent component for the SignUpForm component.
 * @param {*} props - Properties include setAuth and setToken.
 * @returns A component representing the "Sign Up" page.
 */
function SignUp(props) {
  const { setAuth, setToken, setHomepage } = props;

  useEffect(() => {
    setHomepage(false);
  }, [setHomepage]);

  return (
    <>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item md="auto">
          <Header
            text="Sign Up"
            fontSize="40px"
            fontWeight="600"
            margin="20px"
          />
        </Grid>
        <Grid item md={12}>
          <SignUpForm setAuth={setAuth} setToken={setToken} />
        </Grid>
      </Grid>
    </>
  );
}

export default SignUp;
