import React from 'react';
import { Grid, List, ListItem, Box, Container } from '@mui/material';
import { useLocation } from 'react-router';
import QueueCard from '../components/queue/QueueCard';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { errorToast } from '../utils/toast';
import Header from '../components/reusable/Header';
import Typography from '@mui/material/Typography';

function Queue(props) {
  const { token } = props;
  const location = useLocation();
  const { id, date, role, accountid } = location.state;
  const [queue, setQueue] = useState([]);
  const [started, setStarted] = useState(false);
  const [waitlist, setWaitlist] = useState([]);
  const [noshows, setNoshows] = useState([]);

  useEffect(() => {
    // Request to check whether queue has started.
    const queueIsStarted = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const URL = `api/courses/officeHours/${id}/${new Date(date)
          .toISOString()
          .substring(0, 10)}/queueStarted`;
        const response = await axios.get(URL, config);
        setStarted(response.data.isStarted);
      } catch (error) {
        errorToast(error);
      }
    };
    (started || role === 'host') && fetchLists();
    (started || role === 'host') && setInterval(fetchLists, 1000 * 25); // fetch every 30 seconds
    !started && role === 'student' && queueIsStarted();
    !started && role === 'student' && setInterval(queueIsStarted, 1000 * 25); // fetch every 30 seconds
    // TODO: Fetch lists is being called even when the component is unmounted. Big problem!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, started]);

  const fetchLists = async () => {
    let URL = `/api/courses/officeHours/${id}/${date
      .toISOString()
      .substring(0, 10)}/queue`;
    if (role !== 'host') {
      URL += '/student';
    }
    const config = {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      await axios.get(`${URL}`, config).then((result) => {
        setQueue(result.data.queue);
        setWaitlist(result.data.waitlist);
        setNoshows(result.data.noshow);
        return result.data;
      });
    } catch (e) {
      errorToast(e);
    }
  };

  const getQueueCards = () => {
    const list = `queue`;

    const queueCards = queue.map((student) => (
      <ListItem>
        <QueueCard
          date={date}
          id={id}
          token={token}
          student={student}
          list={list}
          fetchLists={fetchLists}
          role={role}
          accountid={accountid}
        />
      </ListItem>
    ));

    return <div>{queueCards}</div>;
  };

  const getWaitlistCards = () => {
    const list = `waitlist`;
    const waitlistCards = waitlist.map((student, index) => (
      <ListItem>
        <QueueCard
          index={index}
          date={date}
          id={id}
          token={token}
          student={student}
          list={list}
          fetchLists={fetchLists}
          role={role}
          accountid={accountid}
          isoneperson={waitlist.length === 1}
          waitlist={waitlist}
        />
      </ListItem>
    ));

    return <div>{waitlistCards}</div>;
  };

  const getNoShowCards = () => {
    const list = `noshow`;

    const noshowCards = noshows.map((student) => (
      <ListItem>
        <QueueCard
          date={date}
          id={id}
          token={token}
          student={student}
          list={list}
          fetchLists={fetchLists}
          role={role}
          accountid={accountid}
        />
      </ListItem>
    ));

    return <div>{noshowCards}</div>;
  };

  const displayQueue = () => {
    return queue.length !== 0 ? (
      <Box
        sx={{
          width: '100%',
          maxWidth: '22vw',
          bgcolor: 'green',
        }}
      >
        <List>{getQueueCards()}</List>
      </Box>
    ) : (
      <Typography variant="no-data">Empty</Typography>
    );
  };

  const displayWaitlist = () => {
    return waitlist.length !== 0 ? (
      <Box
        sx={{
          width: '100%',
          maxWidth: '22vw',
          bgcolor: 'primary.main',
          border: '5px black',
        }}
      >
        <List>{getWaitlistCards()}</List>
      </Box>
    ) : (
      <Typography variant="no-data">Empty</Typography>
    );
  };

  const displayNoShows = () => {
    return noshows.length !== 0 ? (
      <Box
        sx={{
          width: '100%',
          maxWidth: '22vw',
          bgcolor: 'error.main',
        }}
      >
        <List>{getNoShowCards()}</List>
      </Box>
    ) : (
      <Typography variant="no-data">Empty</Typography>
    );
  };

  if (role === 'student') {
    return (
      <Container
        disableGutters
        justifyContent="flex-start"
        sx={{ margin: 0, paddingLeft: 12, paddingRight: 4, minWidth: '100%' }}
      >
        <h1> Office Hour Queue </h1>
        {started && (
          <Grid container spacing={3} align="center">
            <Grid item xs={6}>
              <h1> Queue </h1>
            </Grid>
            <Grid item xs={6}>
              <h1> Waitlist </h1>
            </Grid>
            <Grid item xs={6}>
              {displayQueue()}
            </Grid>
            <Grid item xs={6}>
              {displayWaitlist()}
            </Grid>
          </Grid>
        )}
        {!started && (
          <Header
            text="The queue hasn't been started yet. Please wait for staff to open the queue."
            fontSize="20px"
          />
        )}
      </Container>
    );
  } else {
    return (
      <Container
        disableGutters
        justifyContent="flex-start"
        sx={{ margin: 0, paddingLeft: 12, paddingRight: 4, minWidth: '100%' }}
      >
        <h1> Office Hour Queue </h1>
        <Grid container spacing={3} align="center">
          <Grid item xs={4}>
            <h1> Queue </h1>
          </Grid>
          <Grid item xs={4}>
            <h1> Waitlist </h1>
          </Grid>
          <Grid item xs={4}>
            <h1> No-Shows </h1>
          </Grid>
          <Grid item xs={4}>
            {displayQueue()}
          </Grid>
          <Grid item xs={4}>
            {displayWaitlist()}
          </Grid>
          <Grid item xs={4}>
            {displayNoShows()}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default Queue;
