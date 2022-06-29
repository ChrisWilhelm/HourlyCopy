import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Box, Grid, Typography } from '@mui/material';
import Button from '../components/reusable/controls/Button';
import ConfirmActionDialog from '../components/reusable/ConfirmActionDialog';
import axios from 'axios';
import { successToast } from '../utils/toast';
import { errorToast } from '../utils/toast';

//Addes dashes to phone number
function addDashes(f) {
  /* eslint-disable */
  if (f === null) {
    return f;
  }
  let f_val = f.replace(/\D[^\.]/g, '');
  f = f_val.slice(0, 3) + '-' + f_val.slice(3, 6) + '-' + f_val.slice(6);
  return f;
}

/**
 * The Account Information page that illustrates
 * the details of the users account and gives the ability to delete an account.
 * @param {*} props - Properties include token
 * @returns A component representing the "AccountInfo" page.
 */
export default function AccountInfo(props) {
  const { token, setToken } = props;
  const location = useLocation();
  const userInfo = location.state;
  const email = userInfo.email;
  const username = userInfo.uname;
  const phoneNumber = addDashes(userInfo.phonenumber);
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  let navigate = useNavigate();
  const handleDelete = async () => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const URL = `/api/users/me`;
      const data = await axios.delete(URL, config);
      setOpen(false);
      setToken(undefined);
      navigate('/');
      successToast('Successfully deleted account');
      return data;
    } catch (error) {
      setOpen(false);
      errorToast(error);
    }
  };

  return (
    <Grid
      container
      direction="column"
      spacing={1}
      alignItems="flex-start"
      justifyContent="flex-start"
      sx={{ pl: 10, minHeight: '90vh' }}
    >
      <Grid item sx={{ marginTop: 2, marginBottom: 2 }}>
        <Typography variant="header">My Account Information</Typography>
      </Grid>
      <Grid item>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'bold' }}
        >
          {'Name: '}
        </Typography>
        <Typography display="inline" variant="h4">
          {username}
        </Typography>
      </Grid>
      <Grid item>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'bold' }}
        >
          {'Email: '}
        </Typography>
        <Typography display="inline" variant="h4">
          {email}
        </Typography>
      </Grid>
      {phoneNumber ? (
        <Grid item>
          <Typography
            display="inline"
            variant="h4"
            style={{ fontWeight: 'bold' }}
          >
            {'Phone Number: '}
          </Typography>
          <Typography display="inline" variant="h4">
            {phoneNumber}
          </Typography>
        </Grid>
      ) : null}
      <Grid item>
        <Box sx={{ height: '50vh' }} />
      </Grid>
      <Grid item container justifyContent="center">
        <Button
          text="Delete Account"
          size="large"
          fontSize="20px"
          color="secondary"
          onClick={handleClick}
        />
      </Grid>
      <ConfirmActionDialog
        open={open}
        setOpen={setOpen}
        dialogTitle="Confirm Account Deletion?"
        dialogActionText="Confirm"
        handleAction={handleDelete}
      />
    </Grid>
  );
}
