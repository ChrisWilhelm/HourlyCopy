import EventCalendar from '../components/calendar/EventCalendar';
import { Grid, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import CreateSession from '../components/create-session/CreateSession';
import axios from 'axios';
import Controls from '../components/reusable/controls/Controls';
import { errorToast } from '../utils/toast';

/**
 * Represents a page to view course office hourse.
 * @param {*} props: token
 * @returns A page displaying a calendar with office hours
 */
function Calendar(props) {
  const { token, accountid } = props;

  const location = useLocation();
  const [officeHours, setOfficeHours] = useState([]);
  const { course } = location.state;
  const [open, setOpen] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  /* eslint-disable no-unused-vars */
  const [officehourid, setOfficeHourId] = useState(Number);

  const [selectedDays, setSelectedDays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]); // i=0 is Sunday, i=1 is Monday etc.

  const getDate = (stringDate) => {
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
  };

  const dowToNumber = (dow) => {
    if (dow === 'Sunday') {
      return 0;
    } else if (dow === 'Monday') {
      return 1;
    } else if (dow === 'Tuesday') {
      return 2;
    } else if (dow === 'Wednesday') {
      return 3;
    } else if (dow === 'Thursday') {
      return 4;
    } else if (dow === 'Friday') {
      return 5;
    } else {
      return 6;
    }
  };

  const fetchOfficeHours = async () => {
    const URL = `/api/courses/${course.courseid}/officehours`;
    const config = {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios
      .get(`${URL}`, config)
      .then((result) => {
        const ohWithDays = [];
        result.data.officeHours.forEach((element) => {
          let start = getDate(element.startdate);
          const end = getDate(element.enddate);
          const dow = [];
          const cancelled = [];
          element.daysofweek.forEach((dowElement) => {
            dow.push(dowToNumber(dowElement.dayofweek));
          });
          if (element.cancelleddays !== null) {
            element.cancelleddays.forEach((cancelledElement) => {
              cancelled.push(getDate(cancelledElement.cancelledday).getTime());
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
                hostid: element.hostid,
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
              });
            }
            start.setDate(start.getDate() + 1);
          }
        });
        setOfficeHours(ohWithDays);
      })
      .catch((err) => errorToast(err));
  };

  // get office hours for given course on load:
  useEffect(() => {
    async function fetchData() {
      await fetchOfficeHours();
    }
    (!open || !openInfo) && fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, open, openInfo]);

  const handleClickOpen = () => {
    setOpen(true);
    setSelectedDays([false, false, false, false, false, false, false]);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container
      disableGutters
      justifyContent="flex-start"
      sx={{ margin: 0, paddingLeft: 12, paddingRight: 4, minWidth: '100%' }}
    >
      <EventCalendar
        officeHours={officeHours}
        course={course}
        view={course.view}
        token={token}
        open={openInfo}
        setOpen={setOpenInfo}
        accountid={accountid}
      />
      {course.view === 'Staff' && (
        <>
          <Grid
            direction="row"
            container
            spacing={1}
            justifyContent="space-between"
            minWidth="80vw"
          >
            <Grid item container justifyContent="flex-end">
              <Controls.Button
                text="Create Session"
                onClick={handleClickOpen}
              />
            </Grid>
          </Grid>
          <CreateSession
            open={open}
            onClose={handleClose}
            token={token}
            courseId={course.courseid}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
          />
        </>
      )}
    </Container>
  );
}

export default Calendar;
