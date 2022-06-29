import { Chip, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import DaysOfTheWeek from './DaysOfTheWeek';
import Controls from '../reusable/controls/Controls';
import CreateInput from './CreateInput';
import TimeInterval from './TimeInterval';
import { errorToast } from '../../utils/toast';
import { useForm } from '../reusable/Form';
import { getDate, getTimeInMS } from '../../utils/helpers/helpers';
import { getMe } from '../../utils/requests/users';
import theme from '../../theme';
import { fetchHosts, postCourse } from '../../utils/requests/createSession';
import { getStaffNames } from '../../utils/helpers/createSession';

/**
 * Represents the form that is needed to create a session.
 * @param {*} props:
 * required: token: user's token
 *           courseId: id of a course
 *           open: state variable that determines whether the
 *                 popup is open
 *           selectedDays: state variable that represents the
 *                         the selected days
 *           setSelectedDays: state function that handles the
 *                            selection of days
 *           onClose: function that handles what happens wheb
 *                    popup is closed
 * @returns A form for the CreateSession component.
 */
export default function CreateSessionForm(props) {
  const { token, courseId, selectedDays, setSelectedDays, onClose } = props;

  const [recurring, setRecurring] = useState(true);
  const [addOthers, setAddOthers] = useState(false);
  const [sessionHosts, setHosts] = useState([]);
  const [timeInterval, setTimeInterval] = useState(10);
  const [otherStaff, setOtherStaff] = useState([]);
  const [userId, setUserId] = useState();
  const [map, setMap] = useState(new Map());

  useEffect(() => {
    getMe(token)
      .then(function (response) {
        setHosts([response.data.accountid]);
        setUserId(response.data.accountid);
      })
      .catch(function (err) {
        errorToast(err);
      });
    fetchHosts(token, courseId, userId, setOtherStaff, setMap);
  }, [token, userId, courseId]);

  const handleRecurringInput = () => {
    if (recurring) {
      setRecurring(false);
    } else {
      setRecurring(true);
    }
  };

  const handleAddOthersInput = () => {
    if (addOthers) {
      setAddOthers(false);
    } else {
      setAddOthers(true);
    }
    values.selectedStaff = [];
  };

  const handleSubmit = (event) => {
    if (validate()) {
      postCourse(
        token,
        recurring,
        selectedDays,
        values,
        map,
        sessionHosts,
        courseId,
        timeInterval,
        onClose,
      );
    }
  };

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('startTime' in fields)
      temp.startTime =
        fields.startTime.length !== 0 ? '' : 'Please enter a start time.';

    if ('endTime' in fields) {
      const endTimeMS = getTimeInMS(`${fields.endTime}:00`);
      if (fields.endTime.length === 0) {
        temp.endTime = 'Please enter an end time.';
      } else if (getTimeInMS(`${values.startTime}:00`) >= endTimeMS) {
        temp.endTime = 'End time cannot be equal to or before start time.';
      } else {
        temp.endTime = '';
      }
    }

    if ('startDate' in fields)
      temp.startDate =
        fields.startDate.length !== 0 ? '' : 'Please enter a start date.';

    if ('endDate' in fields && recurring) {
      if (fields.endDate.length === 0) {
        temp.endDate = 'Please enter an end date.';
      } else if (
        getDate(fields.endDate).getTime() < getDate(values.startDate).getTime()
      ) {
        temp.endDate = 'The end date cannot be before the start date.';
      } else {
        temp.endDate = '';
      }
    } else {
      temp.endDate = '';
    }

    if (fields.startDate.length !== 0 && fields.startTime.length !== 0) {
      const now = new Date();
      const start = getDate(fields.startDate);
      start.setHours(parseInt(fields.startTime.substring(0, 2)));
      start.setMinutes(parseInt(fields.startTime.substring(3, 5)));

      if (now.getTime() > start.getTime()) {
        temp.startDate =
          'Please enter a start date such that it is not before the current time.';
        temp.startTime =
          'Please enter a start time such that it is not before the current time.';
      }
    }

    if ('location' in fields)
      temp.location =
        fields.location.length !== 0 ? '' : 'Please enter a location.';

    if ('selectedStaff' in fields && addOthers) {
      temp.selectedStaff =
        fields.selectedStaff.length !== 0
          ? ''
          : 'Please select one or more hosts.';
    } else {
      temp.selectedStaff = '';
    }

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const initialFValues = {
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    location: '',
    selectedStaff: [],
  };

  const { values, errors, setErrors, handleInputChange } = useForm(
    initialFValues,
    false,
    validate,
  );

  return (
    <Box
      display="flex"
      flex={1}
      flexDirection="column"
      alignItems="center"
      width="100%"
    >
      <Box display="flex" flex={1} flexDirection="row" width="100%">
        <CreateInput
          label="Start Time"
          name="startTime"
          value={values.startTime}
          onChange={handleInputChange}
          error={errors.startTime}
          width="100%"
        />
        <CreateInput
          label="End Time"
          name="endTime"
          value={values.endTime}
          onChange={handleInputChange}
          error={errors.endTime}
          width="100%"
        />
      </Box>
      <Controls.Checkbox
        value={recurring}
        onChange={handleRecurringInput}
        label="Recurring Session"
      />
      <Box display="flex" flex={1} flexDirection="row" width="100%">
        <CreateInput
          label={recurring ? 'Start Date' : 'Date'}
          name="startDate"
          value={values.startDate}
          onChange={handleInputChange}
          error={errors.startDate}
          width="100%"
        />
        {recurring && (
          <CreateInput
            label="End Date"
            name="endDate"
            value={values.endDate}
            onChange={handleInputChange}
            error={errors.endDate}
            width="100%"
          />
        )}
      </Box>
      {recurring && (
        <DaysOfTheWeek
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
        />
      )}
      <CreateInput
        label="Location"
        name="location"
        value={values.location}
        onChange={handleInputChange}
        error={errors.location}
        width="92%"
      />
      <TimeInterval value={timeInterval} setValue={setTimeInterval} />
      <Controls.Checkbox
        value={addOthers}
        onChange={handleAddOthersInput}
        label="Add Other Staff"
      />
      {addOthers && (
        <Controls.Dropdown
          label="Staff"
          margin={theme.spacing(1)}
          name="selectedStaff"
          width="92%"
          fontSize="1.1.rem"
          options={getStaffNames(otherStaff)}
          onChange={handleInputChange}
          value={values.selectedStaff}
          error={errors.selectedStaff}
          multiple
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} color="primary" />
              ))}
            </Box>
          )}
        />
      )}
      <Controls.Button
        text="Create"
        onClick={handleSubmit}
        margin={theme.spacing(1.5)}
        fontSize="1.15rem"
      />
    </Box>
  );
}
