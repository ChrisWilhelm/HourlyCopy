import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TodayIcon from '@mui/icons-material/Today';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import MessageIcon from '@mui/icons-material/Message';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import { Fragment } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { Typography } from '@mui/material';
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const getRole = async (token, courseid, setRole, role) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const URL = `/api/courses/${courseid}/role`;
    await axios.get(URL, config).then((res) => {
      setRole(res.data.role);
    });
  } catch (error) {}
};

/**
 * Represents a Material UI Drawer component that allows user to navigate
 * between pages.
 * @param {*} props - Properties include course.
 * @returns A navigation drawer.
 */
function NavigationDrawer(props) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState('');
  const { course, token } = props;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (course) {
      getRole(token, course.courseid, setRole, role);
    }
  }, [token, role, course]);

  // Represents a single icon for navigation drawer button.
  const icon = (text) => {
    if (text === 'Home') {
      return <HomeIcon sx={{ fontSize: '38px' }} />;
    } else if (text === 'Calendar') {
      return <TodayIcon sx={{ fontSize: '38px' }} />;
    } else if (text === 'Registrations' || text === 'Office Hours') {
      return <WatchLaterIcon sx={{ fontSize: '38px' }} />;
    } else if (text === 'Topics') {
      return <LightbulbIcon sx={{ fontSize: '38px' }} />;
    } else if (text === 'Feedback') {
      return <MessageIcon sx={{ fontSize: '38px' }} />;
    } else if (text === 'Analytics') {
      return <BarChartIcon sx={{ fontSize: '38px' }} />;
    } else if (text === 'Roster') {
      return <PeopleIcon sx={{ fontSize: '38px' }} />;
    } else if (text === 'Details') {
      return <InfoIcon sx={{ fontSize: '38px' }} />;
    }
  };

  // Represents a single navigation drawer button.
  const navButton = (text) => {
    let linkTo;
    if (text === 'Home') {
      linkTo = '/courses';
    } else if (text === 'Calendar') {
      linkTo = '/calendar';
    } else if (text === 'Registrations') {
      linkTo = '/registrations';
    } else if (text === 'Office Hours') {
      linkTo = '/office-hours';
    } else if (text === 'Topics') {
      linkTo = '/topics';
    } else if (text === 'Feedback') {
      linkTo = '/feedback';
    } else if (text === 'Analytics') {
      linkTo = '/analytics';
    } else if (text === 'Roster') {
      linkTo = '/roster';
    } else if (text === 'Details') {
      linkTo = '/details';
    }

    return (
      <Link
        to={linkTo}
        state={linkTo === '/courses' ? null : { course: course }}
        style={{ textDecoration: 'none' }}
        key={text}
      >
        <ListItemButton
          sx={{
            minHeight: 60,
            justifyContent: open ? 'initial' : 'center',
            px: 2.0,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon(text)}
          </ListItemIcon>
          <ListItemText
            primary={text}
            primaryTypographyProps={{
              fontSize: '25px',
              fontWeight: '700',
              color: 'white',
            }}
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </Link>
    );
  };

  return (
    <Fragment>
      <CssBaseline />
      <Drawer
        variant="permanent"
        open={open}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          },
        }}
      >
        <DrawerHeader>
          {open ? (
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </DrawerHeader>
        <Divider />
        <List>
          {course?.title
            ? role === 'instructor'
              ? [
                  'Home',
                  'Calendar',
                  'Office Hours',
                  'Topics',
                  'Feedback',
                  'Analytics',
                  'Roster',
                  'Details',
                ].map((text, index) => navButton(text))
              : role === 'staff'
              ? [
                  'Home',
                  'Calendar',
                  'Office Hours',
                  'Topics',
                  'Feedback',
                  'Roster',
                  'Details',
                ].map((text, index) => navButton(text))
              : ['Home', 'Calendar', 'Registrations', 'Details'].map(
                  (text, index) => navButton(text),
                )
            : open && (
                <div>
                  <Typography align="center">Welcome to Hourly! </Typography>
                </div>
              )}
        </List>
      </Drawer>
    </Fragment>
  );
}

export default NavigationDrawer;
