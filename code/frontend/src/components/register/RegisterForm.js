import { Grid } from '@mui/material';
import * as React from 'react';
import axios from 'axios';
import { Form, useForm } from '../../components/reusable/Form';
import Controls from '../../components/reusable/controls/Controls';
import {
  Chip,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { Box } from '@mui/system';
import { useState, useEffect } from 'react';
import { getMilitaryTime, getLocaleTime } from '../../utils/helpers/helpers';
import { errorToast, successToast } from '../../utils/toast';
import { useNavigate } from 'react-router';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// TODO: Need the GET request to retrieve concepts for a course.
/*const concepts = [
  { id: '1', title: 'Arrays' },
  { id: '2', title: 'Loops' },
  { id: '3', title: 'Recursion' },
  { id: '4', title: 'I/O' },
  { id: '5', title: 'Sorting' },
];*/

/**
 * Helper function to see if the office hour is currently taking place
 * Needed to determine if the 'View Queue' button should appear
 * @param {json} session - information representing the session
 * @returns true if it is in session, and false otherwise
 */
function isOfficeHourInSession(session) {
  const startDateInMS = session.startdate.getTime();
  const startDateAndTime = new Date(
    startDateInMS + getTimeInMS(session.starttime),
  );
  const endDateAndTime = new Date(startDateInMS + getTimeInMS(session.endtime));

  const todaysDate = new Date();

  return todaysDate >= startDateAndTime && todaysDate < endDateAndTime;
}

/**
 * Helper function to convert a string to miliseconds
 * so that it may be converted to a date object
 * @param {string} session - a string representing a '00:00:00' formatted time
 * @returns how many miliseconds from the start date that time is
 */
function getTimeInMS(time) {
  let ms = 0;

  let numHours = time.substring(0, 2);
  let numMins = time.substring(3, 5);
  let numSecs = time.substring(6, 8);

  ms += parseInt(numHours) * 1000 * 60 * 60;
  ms += parseInt(numMins) * 1000 * 60;
  ms += parseInt(numSecs) * 1000;

  return ms;
}

/**
 * A component that represents the form that users fill out to
 * register for a session.
 * @param {*} props - Properties include onClose, token, officeHour, start, end, and title.
 * @returns A register form component.
 */
function RegisterForm(props) {
  const {
    onClose,
    token,
    officeHour,
    start,
    end,
    title,
    course,
    queueStarted,
    accountid,
  } = props;
  const [times, setTimes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [waitlist, setJoinWaitlist] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setJoinWaitlist(false);
    // Request to get available time slots.
    const getTimes = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const URL = `api/courses/officeHours/${
          officeHour.officehourid
        }/times/${new Date(officeHour.startdate)
          .toISOString()
          .substring(0, 10)}`;
        const response = await axios.get(URL, config);
        setTimes(response.data.times);
      } catch (error) {
        errorToast(error);
      }
    };

    const fetchTopics = async () => {
      const URL = `/api/courses/${course.courseid}/topicTags`;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios
        .get(`${URL}`, config)
        .then(function (response) {
          setTopics(response.data.topicTags);
        })
        .catch(function (err) {
          errorToast(err);
        });
    };

    getTimes();
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, officeHour.officehourid, officeHour.startdate, course.courseid]);

  const getOptions = () => {
    const options = [];
    for (let i = 0; i < topics.length; i++) {
      options.push({ id: topics[i].topicid, title: topics[i].topicvalue });
    }
    return options;
  };

  const initialFValues = {
    times: '',
    questions: '',
    topicTagIds: [],
  };

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('times' in fields) {
      temp.times = fields.times.length !== 0 ? '' : 'This field is required.';
    }

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const { values, errors, setErrors, handleInputChange } = useForm(
    initialFValues,
    false,
    validate,
  );

  // Options for the dropdown selector.
  const getTimesCollecton = () => {
    const timesSlots = [];

    for (let i = 0; i < times.length; i++) {
      const localeStartTime = getLocaleTime(times[i].starttime);
      const localeEndTime = getLocaleTime(times[i].endtime);
      timesSlots.push({
        id: `${i + 1}`,
        title: `${localeStartTime} - ${localeEndTime}`,
      });
    }

    return timesSlots;
  };

  const register = async () => {
    const timesArr = values.times.split(' - ');
    const startTime = getMilitaryTime(timesArr[0]);
    const endTime = getMilitaryTime(timesArr[1]);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const params = {
        startTime: startTime,
        endTime: endTime,
        questions: values.questions ? [values.questions] : [],
        topicTagIds: values.topicTagIds,
        date: new Date(officeHour.startdate).toISOString().substring(0, 10),
      };
      const URL = `api/courses/officehours/${officeHour.officehourid}/register`;
      await axios.post(URL, params, config);
      onClose();
      successToast('Successfully registered!');
    } catch (error) {
      errorToast(error);
    }
  };

  const joinWaitlist = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const params = {
        date: new Date(officeHour.startdate).toISOString().substring(0, 10),
      };
      const URL = `api/courses/officeHours/${officeHour.officehourid}/queue/waitlist`;
      await axios.post(URL, params, config);
      onClose();
      successToast('Successfully secured spot on waitlist!');
      if (queueStarted) {
        navigate('/queue', {
          state: {
            role: 'student',
            id: officeHour.officehourid,
            date: new Date(officeHour.startdate),
            accountid: accountid,
            course: course,
          },
        });
      }
    } catch (error) {
      errorToast(error);
    }
  };

  // TODO: Is there a more intutitve/simpler way to handle this?
  const selectedTitles = (selected) => {
    const topicIds = [];
    const topicTitles = [];
    const selectedTitles = [];

    for (let i = 0; i < topics.length; i++) {
      topicIds.push(topics[i].topicid);
      topicTitles.push(topics[i].topicvalue);
    }

    for (let j = 0; j < selected.length; j++) {
      const index = topicIds.findIndex((element) => element === selected[j]);

      if (index !== -1) {
        selectedTitles.push(topicTitles[index]);
      }
    }

    return selectedTitles;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isOfficeHourInSession(officeHour) || waitlist) {
      joinWaitlist();
    } else {
      if (validate()) {
        register();
      }
    }
  };

  const close = () => {
    setJoinWaitlist(false);
    onClose();
  };

  const handleWaitlistSelect = () => {
    if (waitlist) {
      setJoinWaitlist(false);
    } else {
      setJoinWaitlist(true);
    }
  };

  const styles = {
    checkbox: {
      color: 'blue',
    },
  };

  return (
    <Form onSubmit={handleSubmit}>
      <DialogContent>
        <Grid container justifyContent="flex-end">
          <IconButton onClick={close}>
            <ClearIcon />
          </IconButton>
        </Grid>
        <DialogTitle textAlign="center" style={{ fontWeight: '600' }}>
          <div>
            <div>
              {!isOfficeHourInSession(officeHour) &&
                !waitlist &&
                `You are about to register for ` + title + ' on '}
              {(isOfficeHourInSession(officeHour) || waitlist) &&
                `You are about to sign-up for the waitlist for ` +
                  title +
                  ' on '}
              <div>
                {officeHour.daysofweek[0].dayofweek}{' '}
                {officeHour.startdate.toLocaleDateString()} from{' '}
              </div>
            </div>
            <div>
              {getLocaleTime(start)} to {getLocaleTime(end)}
            </div>
          </div>
        </DialogTitle>
        {!isOfficeHourInSession(officeHour) && !waitlist && (
          <Grid container justifyContent="center">
            <Controls.Dropdown
              label="Available Timeslots"
              name="times"
              value={values.times}
              onChange={handleInputChange}
              options={getTimesCollecton()}
              width="400px"
              error={errors.times}
            />
          </Grid>
        )}
        {!isOfficeHourInSession(officeHour) && (
          <Grid container justifyContent="center">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    style={styles.checkbox}
                    defaultChecked={waitlist}
                    onChange={handleWaitlistSelect}
                  />
                }
                label="No desireable times? Join the Waitlist here!"
              ></FormControlLabel>
            </FormGroup>
          </Grid>
        )}
        {!isOfficeHourInSession(officeHour) && !waitlist && (
          <DialogContentText margin="20px" textAlign="center" color="black">
            Submit any topics/questions below (optional):
          </DialogContentText>
        )}
        <Grid
          container
          justifyContent="center"
          direction="column"
          alignItems="center"
        >
          {!isOfficeHourInSession(officeHour) && !waitlist && (
            <Grid item>
              <Controls.Dropdown
                label="Topics"
                name="topicTagIds"
                margin="15px"
                idOrTitle="id"
                value={values.topicTagIds}
                onChange={handleInputChange}
                options={getOptions()}
                width="400px"
                multiple
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedTitles(selected).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              />
            </Grid>
          )}
          {!isOfficeHourInSession(officeHour) && !waitlist && (
            <Grid item>
              <Controls.InputText
                name="questions"
                margin="15x"
                multiline
                width="400px"
                fontSize={15}
                placeholder="List any questions/concepts that you would like course staff to be aware of before the session."
                onChange={handleInputChange}
                value={values.questions}
              />
            </Grid>
          )}
          <Grid item>
            <Controls.Button text="Submit" type="submit" />
          </Grid>
        </Grid>
      </DialogContent>
    </Form>
  );
}

export default RegisterForm;
