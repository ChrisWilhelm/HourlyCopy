import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { Container, Grid, Typography } from '@mui/material';
import Controls from '../components/reusable/controls/Controls';
import { useLocation } from 'react-router';
import MyPageItem from '../components/my-page/MyPageItem';
import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackDialog from '../components/feedback/FeedbackDialog';
import ConfirmActionDialog from '../components/reusable/ConfirmActionDialog';
import Summary from '../components/summary/Summary';
import { errorToast, successToast } from '../utils/toast';
import { cancelOfficeHour } from '../utils/requests/officeHours';

/**
 * Retrieves the number of the day.
 * @param {string} time - a string representing the day
 * @returns the number associated with the day.
 */
function getDayNum(day) {
  if (day === 'Sunday') {
    return 0;
  } else if (day === 'Monday') {
    return 1;
  } else if (day === 'Tuesday') {
    return 2;
  } else if (day === 'Wednesday') {
    return 3;
  } else if (day === 'Thursday') {
    return 4;
  } else if (day === 'Friday') {
    return 5;
  }
  return 6;
}

/**
 * Updates a Date object with a time represented by string H:M:S
 * @param {Date} date - a date object
 * @param {string} time - a string representing the 24H time in a date
 */
const updateDateWithTime = (date, time) => {
  const hms = time.split(':').map((item) => parseInt(item, 10));
  date.setHours(hms[0]);
  date.setMinutes(hms[1]);
  date.setSeconds(hms[2]);
  return date;
};

/**
 * Get session date
 * @param {string} date - a date object
 * @param {string} time - a string representing the 24H time in a date
 */
const getSessionDateObj = (date, time) => {
  const session = updateDateWithTime(new Date(date), time);
  return session;
};

/**
 * Retrieves the past day.
 * @param {Date} today - a Date object representing today
 * @param {number} day - number associated with a day
 * @param {string} startHour - number representing the hour of the start date
 * @param {string} startMin - number representing the minutes of the start date
 * @param {string} endHour - number representing the hour of the end date
 * @param {string} endMin - number representing the minutes of the end date
 * @returns a Date object representing the last/past day.
 */
function getDate(stringDate) {
  let i = 0;
  let year = '';
  let month = ''; // subtract 1
  let day = '';
  while (stringDate.charAt(i) !== '-') {
    year += stringDate.charAt(i);
    i++;
  }
  i++;
  while (stringDate.charAt(i) !== '-') {
    month += stringDate.charAt(i);
    i++;
  }
  i++;
  while (i < stringDate.length) {
    day += stringDate.charAt(i);
    i++;
  }
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * A conditional component for the "My Registrations" and "My Office Hours" pages.
 * @param {*} props - Properties include token, header, and type.
 * @returns A conditional component for the "My Registrations" and "My Office Hours" pages.
 */
function MyPage(props) {
  const { token, header, type } = props;

  const location = useLocation();
  const { course } = location.state;

  const [option, setOption] = useState('Upcoming');
  const [sessions, setSessions] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [registrationId, setRegistrationId] = useState(-1);
  const [officeHourId, setOfficeHourId] = useState(-1);
  const [isRecurring, setIsRecurring] = useState(false);

  const [openFeedback, setOpenFeedback] = useState(false);
  const [viewQuestionsOpen, setViewQuestionsOpen] = useState(false);

  const [openCancel, setOpenCancel] = useState(false);

  const handleInputChange = (event) => setOption(event.target.value);

  // User can select between past and upcoming registrations
  const options = [
    { id: '1', title: 'Upcoming' },
    { id: '2', title: 'Past' },
    { id: '3', title: 'Now' },
  ];

  const handleViewQuestionsClose = () => {
    setViewQuestionsOpen(false);
  };

  // TODO fix url
  const handleCancel = async () => {
    const cancelUrl =
      type === 'registration'
        ? `/api/courses/officeHours/registrations/${registrationId}/cancel`
        : `/api/courses/officehours/${officeHourId}/cancel`;
    await axios
      .post(cancelUrl, type === 'office' ? { date } : null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        successToast('Successfully cancelled');
        setSessions([]);
      })
      .catch((err) => errorToast(err));
  };

  const handleCancelRecurring = async (option) => {
    await cancelOfficeHour(officeHourId, option, date, token)
      .then(() => successToast('Successfully cancelled'))
      .catch((err) => errorToast(err));
  };

  // Check if the office hour id is recurring
  useEffect(() => {
    const isOfficeHourIdRecurring = (id) => {
      const recurring = sessions.some((session) => {
        if (session.officehourid === id) {
          return session.recurringevent;
        }
        return false;
      });
      return recurring;
    };
    setIsRecurring(isOfficeHourIdRecurring(officeHourId));
  }, [officeHourId, sessions]);

  useEffect(() => {
    if (type === 'office') {
      const fetchSessions = async () => {
        await axios
          .get(`api/users/me/hosting/${course.courseid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(function (response) {
            const ohWithDays = [];
            response.data.officeHours.forEach((element) => {
              let start = getDate(element.startdate);
              const end = getDate(element.enddate);
              const dow = [];
              const cancelled = [];
              element.daysofweek.forEach((dowElement) => {
                dow.push(getDayNum(dowElement.dayofweek));
              });
              if (element.cancelleddays !== null) {
                element.cancelleddays.forEach((cancelledElement) => {
                  cancelled.push(
                    getDate(cancelledElement.cancelledday).getTime(),
                  );
                });
              }
              while (start <= end) {
                if (
                  dow.includes(start.getDay()) &&
                  !cancelled.includes(start.getTime())
                ) {
                  ohWithDays.push({
                    hostname: element.hostname,
                    hostemail: element.hostemail,
                    officehourid: element.officehourid,
                    starttime: element.starttime,
                    endtime: element.endtime,
                    recurringevent: element.recurringevent,
                    startdate: new Date(start.getTime()),
                    enddate: new Date(start.getTime()),
                    ohlocation: element.ohlocation,
                    courseid: element.courseid,
                    maxseats: element.maxseats,
                    daysofweek: element.daysofweek,
                    cancelleddays: element.cancelleddays,
                    ohdate: `${start.getFullYear()}-${
                      start.getMonth() + 1
                    }-${start.getDate()}`,
                  });
                }
                start.setDate(start.getDate() + 1);
              }
            });
            console.log(ohWithDays);
            setSessions(ohWithDays);
          })
          .catch(function (err) {
            errorToast(err);
          });
      };
      !openCancel && fetchSessions();
    } else {
      const fetchRegistrations = async () => {
        await axios
          .get(`api/users/me/registrations/${course.courseid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setSessions(
              res.data.registrations.filter((item) => !item.iscancelled),
            );
          })
          .catch(function (err) {
            errorToast(err);
          });
      };
      !openCancel && fetchRegistrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, course, type, openCancel, option]);

  const now = new Date();
  let upcoming = [];
  let past = [];
  const ongoing = [];
  let updatedSessions = sessions;

  for (let i = 0; i < updatedSessions.length; i++) {
    const sessionStart = getSessionDateObj(
      type === 'office'
        ? updatedSessions[i].startdate
        : updatedSessions[i].ohdate,
      updatedSessions[i].starttime,
    );

    const sessionEnd = getSessionDateObj(
      type === 'office'
        ? updatedSessions[i].enddate
        : updatedSessions[i].ohdate,
      updatedSessions[i].endtime,
    );

    if (sessionEnd.getTime() <= now.getTime()) {
      let alreadyPushed = false;
      for (let j = 0; j < past.length; j++) {
        const tempStart = getSessionDateObj(
          type === 'office' ? past[j].startdate : past[j].ohdate,
          past[j].starttime,
        );
        if (sessionStart.getTime() < tempStart.getTime()) {
          past.splice(j, 0, updatedSessions[i]);
          alreadyPushed = true;
          break;
        }
      }
      if (alreadyPushed === false) {
        past.push(updatedSessions[i]);
      }
    } else if (sessionStart.getTime() >= now.getTime()) {
      let alreadyPushed = false;
      for (let j = 0; j < upcoming.length; j++) {
        const tempStart = getSessionDateObj(
          type === 'office' ? upcoming[j].startdate : upcoming[j].ohdate,
          upcoming[j].starttime,
        );
        if (sessionStart.getTime() < tempStart.getTime()) {
          upcoming.splice(j, 0, updatedSessions[i]);
          alreadyPushed = true;
          break;
        }
      }
      if (alreadyPushed === false) {
        upcoming.push(updatedSessions[i]);
      }
    } else {
      ongoing.push(updatedSessions[i]);
    }
  }

  useEffect(() => {
    console.log(sessions);
  }, [sessions]);

  return (
    <Container disableGutters sx={{ pl: 12, pr: 4, minWidth: '100%' }}>
      <Grid container direction="row" alignItems="center">
        <Grid item>
          <Typography variant="header">{header}</Typography>
        </Grid>
        <Grid item md={6.3}>
          <Controls.Dropdown
            options={options}
            value={option}
            onChange={handleInputChange}
            defaultValue={options[0].title}
            width="150px"
          />
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', ml: -1.5 }}>
        {option === 'Upcoming' &&
          (upcoming.length > 0 ? (
            <List disablePadding>
              {' '}
              {upcoming.map((session, index) => {
                return (
                  <MyPageItem
                    session={session}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    course={course}
                    key={index}
                    option={option}
                    type={type}
                    setId={
                      type === 'registration'
                        ? setRegistrationId
                        : setOfficeHourId
                    }
                    setDate={setDate}
                    setOpen={
                      type === 'office' ? setViewQuestionsOpen : setOpenCancel
                    }
                    setCancel={setOpenCancel}
                  />
                );
              })}
            </List>
          ) : (
            <Typography variant="no-data" margin="15px">
              No Upcoming Sessions
            </Typography>
          ))}
        {option === 'Past' &&
          (past.length > 0 ? (
            <List>
              {' '}
              {past.reverse().map((session, index) => {
                return (
                  <MyPageItem
                    session={session}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    course={course}
                    key={index}
                    option={option}
                    type={type}
                    setDate={setDate}
                    setId={
                      type === 'registration'
                        ? setRegistrationId
                        : setOfficeHourId
                    }
                    setOpen={
                      type === 'office' ? setViewQuestionsOpen : setOpenFeedback
                    }
                  />
                );
              })}
            </List>
          ) : (
            <Typography variant="no-data" margin="15px">
              No Past Sessions
            </Typography>
          ))}
        {option === 'Now' &&
          (ongoing.length > 0 ? (
            <List>
              {' '}
              {ongoing.map((session, index) => {
                return (
                  <MyPageItem
                    session={session}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    course={course}
                    key={index}
                    option={option}
                    type={type}
                    setDate={setDate}
                    setId={
                      type === 'registration'
                        ? setRegistrationId
                        : setOfficeHourId
                    }
                    setOpen={setViewQuestionsOpen}
                  />
                );
              })}
            </List>
          ) : (
            <Typography variant="no-data" margin="15px">
              No Current Sessions
            </Typography>
          ))}
      </Box>
      {/* Only show for registrations */}
      <FeedbackDialog
        registrationId={registrationId}
        token={token}
        open={openFeedback}
        setOpen={setOpenFeedback}
      />
      {/* Render cancel dialog OH (recurring) or registrations (one-time)*/}
      <ConfirmActionDialog
        dialogContentText={`Delete ${
          type === 'office' ? 'Office Hours' : 'Registration'
        }?`}
        dialogActionText="OK"
        handleAction={type === 'office' ? handleCancelRecurring : handleCancel}
        options={
          type === 'office' &&
          (isRecurring
            ? [
                { value: 'this', label: 'This event' },
                {
                  value: 'following',
                  label: 'This and following events',
                },
                { value: 'all', label: 'All events' },
              ]
            : [{ value: 'this', label: 'This event' }])
        }
        open={openCancel}
        setOpen={setOpenCancel}
      />
      <Summary
        onClose={handleViewQuestionsClose}
        open={viewQuestionsOpen}
        officeHourId={officeHourId}
        date={date}
        startTime={startTime}
        endTime={endTime}
        token={token}
      />
    </Container>
  );
}

export default MyPage;
