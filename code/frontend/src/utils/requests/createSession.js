import axios from 'axios';
import { toast } from 'react-toastify';
import { getDate, getStrFromDayNum } from '../helpers/helpers';
import { successToast, errorToast } from '../toast';
import { getAuthConfig } from './config';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Request to retrieve hosts
export const fetchHosts = async (
  token,
  courseId,
  userId,
  setOtherStaff,
  setMap,
) => {
  try {
    let hostNameToId = new Map();
    const URL = `/api/courses/${courseId}/getRoster`;
    const data = await axios.get(URL, getAuthConfig(token));
    let staff = [];
    for (let i = 0; i < data.data.staff.length; i++) {
      if (data.data.staff[i].accountid !== userId) {
        staff.push(data.data.staff[i]);
        hostNameToId.set(
          data.data.staff[i].username,
          data.data.staff[i].accountid,
        );
      }
    }
    for (let i = 0; i < data.data.instructors.length; i++) {
      if (data.data.instructors[i].accountid !== userId) {
        staff.push(data.data.instructors[i]);
        hostNameToId.set(
          data.data.instructors[i].username,
          data.data.instructors[i].accountid,
        );
      }
    }
    setOtherStaff(staff);
    setMap(hostNameToId);
  } catch (err) {
    errorToast(err);
  }
};

// Request to create a course
export const postCourse = async (
  token,
  recurring,
  selectedDays,
  values,
  map,
  sessionHosts,
  courseId,
  timeInterval,
  onClose,
) => {
  const URL = `/api/courses/officeHours/create`;
  let daysOfWeek = [];

  if (recurring) {
    for (let i = 0; i < selectedDays.length; i++) {
      if (selectedDays[i]) {
        daysOfWeek.push(DAYS[i]);
      }
    }
    // Throw an error toast if user forgets to select days of the week
    // for a recurring session.
    if (daysOfWeek.length === 0 && recurring) {
      toast.error('Please select a day!');
      return;
    }
  } else {
    daysOfWeek[0] = getStrFromDayNum(getDate(values.startDate).getDay());
  }

  let otherHosts = [];
  for (let i = 0; i < values.selectedStaff.length; i++) {
    otherHosts.push(map.get(values.selectedStaff[i]));
  }
  otherHosts.push(sessionHosts[0]); // session hosts only contains user right now
  await axios
    .post(
      `${URL}`,
      {
        startTime: values.startTime,
        endTime: values.endTime,
        recurringEvent: recurring,
        startDate: getDate(values.startDate),
        endDate: recurring
          ? getDate(values.endDate)
          : getDate(values.startDate),
        location: values.location,
        courseId: courseId,
        daysOfWeek: daysOfWeek,
        timeInterval: timeInterval,
        hosts: otherHosts,
      },
      getAuthConfig(token),
    )
    .then((response) => {
      onClose();
      successToast('Successfully created session');
    })
    .catch((err) => {
      errorToast(err);
    });
};
