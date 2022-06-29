import { AppBar, Grid, IconButton, Toolbar } from '@mui/material';
import { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Header from '../reusable/Header';
import NotificationPopover from './NotificationPopover';
import NavigationDrawer from './NavigationDrawer';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Logo from '../../images/hourlyLogo.png';
/**
 * Represents a app header component that makes use of the Material UI
 * components AppBar and Toolbar.
 * @param {*} props - Properties.
 * @returns An app header component.
 */
function AppHeader(props) {
  const { text, fontWeight, margin, token, setToken } = props; // Add more properties here!

  const theme = useTheme();

  const location = useLocation();
  const drawerWidth = 240;
  let navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = false;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setToken(null);
    handleClose();
    navigate('/');
  };
  const getUserInfo = async () => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      handleClose();
      const URL = `/api/users/me`;
      const data = await axios.get(URL, config);
      const userInfo = data.data;
      navigate('/info', { state: userInfo });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <Grid container spacing={1}>
            <Grid item>
              {token && (
                <NavigationDrawer
                  course={location?.state?.course}
                  token={token}
                />
              )}
            </Grid>
            <Grid item>
              <Grid container direction="row">
                <Grid item>
                  {!location?.state?.course?.title && (
                    <img src={Logo} alt=" " width="30px" height="30px" />
                  )}
                </Grid>
                <Grid item>
                  <Header
                    text={location?.state?.course?.title || text}
                    fontSize="20px"
                    fontWeight={fontWeight}
                    margin={margin}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {token && (
            <Grid item>
              <NotificationPopover token={token} />
            </Grid>
          )}
          {token && (
            <Grid item>
              <IconButton onClick={handleClick}>
                <AccountCircleIcon
                  style={{ color: 'white', fontSize: '30px' }}
                />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={getUserInfo}>My account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Grid>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Fragment>
  );
}

export default AppHeader;
