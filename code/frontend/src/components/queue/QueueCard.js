import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { errorToast, successToast } from '../../utils/toast';

function QueueCard(props) {
  const {
    list,
    student,
    token,
    fetchLists,
    id,
    date,
    index,
    role,
    isoneperson,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;

  /**
   * Helper function to get the locale time.
   * @param {string} time - a string represent a 00:00:00 time
   * @returns a short localized time string.
   */
  function getLocaleTime(time) {
    const [hour, min] = time.split(':');
    const timeObj = new Date();
    timeObj.setHours(hour);
    timeObj.setMinutes(min);
    return timeObj.toLocaleTimeString([], { timeStyle: 'short' });
  }

  let timeText = ``;
  if (list !== 'waitlist') {
    timeText =
      `TIME: ` +
      getLocaleTime(student.starttime) +
      ` - ` +
      getLocaleTime(student.endtime);
  }

  const card = (
    <React.Fragment>
      <CardContent>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {role === 'host' && student.uname}
          {role !== 'host' &&
            !student.isusersaccount &&
            'Student ' +
              (student.queueposition >= 0
                ? student.queueposition + 1
                : student.waitlistposition)}
          {role !== 'host' && student.isusersaccount && 'MY POSITION'}
        </Typography>
        <Typography>{timeText}</Typography>
      </CardContent>
    </React.Fragment>
  );

  const queueToNoshows = async () => {
    const URL = `/api/courses/officeHours/${id}/queue/${student.accountid}/noShow`;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios
      .post(
        `${URL}`,
        {
          date: date.toISOString().substring(0, 10),
          registrationId: student.registrationid,
        },
        config,
      )
      .then((result) => {
        fetchLists();
        successToast(student.uname + ' successfully moved to no shows');
      })
      .catch((error) => {
        errorToast(error);
      });
  };

  const removeFromQueue = async () => {
    const formattedDate = date.toISOString().substring(0, 10);
    const URL = `/api/courses/officeHours/${id}/${formattedDate}/queue/${student.accountid}`;
    await axios
      .delete(`${URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((result) => {
        fetchLists();
        successToast(student.uname + ' successfully removed from queue');
      })
      .catch((error) => {
        errorToast(error);
      });
  };

  const moveToEndOfWaitlist = async () => {
    const URL = `/api/courses/officeHours/${id}/queue/waitlist/toBack`;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios
      .patch(
        `${URL}`,
        {
          date: date.toISOString().substring(0, 10),
        },
        config,
      )
      .then((result) => {
        fetchLists();
        successToast(student.uname + ' successfully moved to end of waitlist');
      })
      .catch((error) => {
        errorToast(error);
      });
  };

  const removeFromWaitlist = async () => {
    const formattedDate = date.toISOString().substring(0, 10);
    const URL = `/api/courses/officeHours/${id}/${formattedDate}/waitlist/${student.accountid}`;
    await axios
      .delete(`${URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((result) => {
        fetchLists();
        successToast(student.uname + ' successfully removed from waitlist');
      })
      .catch((error) => {
        errorToast(error);
      });
  };

  const getButtons = () => {
    let text1 = ``;
    let text2 = ``;
    let onClick1 = () => {};
    let onClick2 = () => {};
    if (list === `queue`) {
      text1 = `Move to No-Shows`;
      text2 = `Remove from Queue`;
      onClick1 = queueToNoshows;
      onClick2 = removeFromQueue;
    } else if (list === `waitlist`) {
      text1 = `Move to end of Waitlist`;
      text2 = `Remove from Waitlist`;
      onClick1 = moveToEndOfWaitlist;
      onClick2 = removeFromWaitlist;
      if (index !== 0 || isoneperson) {
        // should not be able to moveToEnd if the user is not in position 1 or if they are the only person in line
        return (
          <Card sx={{ maxWidth: '20vw' }}>
            <CardActions>
              <Button size="small" onClick={onClick2}>
                {text2}
              </Button>
            </CardActions>
          </Card>
        );
      }
    } else if (list === `noshow`) {
      return;
    }
    return (
      <Card sx={{ maxWidth: '20vw' }}>
        <CardActions>
          <Button size="small" onClick={onClick1}>
            {text1}
          </Button>
        </CardActions>
        <CardActions>
          <Button size="small" onClick={onClick2}>
            {text2}
          </Button>
        </CardActions>
      </Card>
    );
  };

  const OutlinedCard = () => {
    return (
      <Box sx={{ width: '20vw' }}>
        <Card variant="outlined" onClick={handleClick}>
          {card}
        </Card>
        {list !== `noshow` && role !== 'student' && (
          <Popover
            id={popoverId}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            {getButtons()}
          </Popover>
        )}
      </Box>
    );
  };

  return <div> {OutlinedCard()} </div>;
}

export default QueueCard;
