import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Popover,
  Badge,
} from '@mui/material';
import { Clear, Notifications } from '@mui/icons-material';
import { errorToast } from '../../utils/toast';

export default function NotificationPopover({ token }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [trigger, setTrigger] = useState(false);

  // Update notifications every 30 seconds
  const getNotifications = useCallback(async () => {
    // { notifications: [{accountid, notificationcontent, createdat, notificationid }, ...]}
    await axios
      .get(`/api/users/me/notifs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotifications(res.data.notifications);
      })
      .catch((err) => {
        errorToast(err);
      });
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getNotifications().then(setTrigger(!trigger));
      return () => clearTimeout(timer);
    }, 3e4);
    return () => {
      clearTimeout(timer);
    };
  }, [trigger, token, getNotifications]);

  // Get notifications when first rendered
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  // Remove a notification from the list
  function handleRemove(id) {
    // Remove notifications first from frontend so client is not
    // waiting on backend
    const oldnotifications = notifications;
    const newNotifications = notifications.filter(
      (item) => item.notificationid !== id,
    );
    setNotifications(newNotifications);
    axios
      .delete(`/api/users/me/notifs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.status === 200) {
        } else {
          setNotifications(oldnotifications);
          console.log('Failed to delete notification.');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Open the popover
  const handleClick = (event) => {
    getNotifications();
    setAnchorEl(event.currentTarget);
  };

  // Close the popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <div>
      <IconButton onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="secondary">
          <Notifications style={{ color: 'white', fontSize: '30px' }} />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List sx={{ width: '100%', maxWidth: 360 }}>
          {notifications.length > 0 ? (
            notifications.map((item) => {
              return (
                <ListItem
                  key={item.notificationid}
                  style={{ display: 'flex' }}
                  divider
                  secondaryAction={
                    <IconButton
                      onClick={() => handleRemove(item.notificationid)}
                    >
                      <Clear />
                    </IconButton>
                  }
                >
                  <ListItemText primary={item.notificationcontent} />
                </ListItem>
              );
            })
          ) : (
            <ListItem key={0}>
              <Typography>No Notifications</Typography>
            </ListItem>
          )}
        </List>
      </Popover>
    </div>
  );
}
