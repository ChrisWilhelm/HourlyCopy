import { Grid } from '@mui/material';
import Header from '../components/reusable/Header';
import LoginForm from '../components/login/LoginForm';
import { useEffect } from 'react';

/**
 * Parent component for the LoginForm component.
 * @param {*} props - Properties include setAuth and setToken.
 * @returns A component representing the "Login" page.
 */
function Login(props) {
  const { setAuth, setToken, setHomepage } = props;

  // Clear the token and auth when this page is opened
  useEffect(() => {
    setToken('');
    setAuth(false);
    setHomepage(false);
  }, [setToken, setAuth, setHomepage]);

  return (
    <>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item md="auto">
          <Header text="Login" fontSize="40px" fontWeight="600" margin="20px" />
        </Grid>
        <Grid item md={12}>
          <LoginForm setAuth={setAuth} setToken={setToken} />
        </Grid>
      </Grid>
    </>
  );
}

export default Login;
