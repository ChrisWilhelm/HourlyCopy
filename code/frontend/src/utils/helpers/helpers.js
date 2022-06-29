/**
 * Converts standard time to military time.
 * @param {string} timeStr - a string represent a hh:mm PM/AM time
 * @returns a military time in the form of hh:mm:ss.
 */
export function getMilitaryTime(timeStr) {
  const [time, amOrPm] = timeStr.split(' ');
  const [hour, min] = time.split(':');

  if (amOrPm === 'AM') {
    if (hour === '12') {
      return `00:${min}:00`;
    } else if (parseInt(hour) < 10) {
      return `0${hour}:${min}:00`;
    }
    return `${hour}:${min}:00`;
  } else {
    const intHour = 12 + (parseInt(hour) % 12);
    return `${intHour}:${min}:00`;
  }
}

/**
 * Converts military time to standard time.
 * @param {string} time - a string representing a hh:mm:ss military time
 * @returns a short localized time string.
 */
export function getLocaleTime(time) {
  const [hour, min] = time.split(':');
  const timeObj = new Date();
  timeObj.setHours(hour);
  timeObj.setMinutes(min);
  return timeObj.toLocaleTimeString([], { timeStyle: 'short' });
}

// Compares two day strings
export const dayOfWeekComparator = (day1, day2) => {
  const days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  return days[day1] - days[day2];
};

// Compares two locale times: 'HH:MM:SS AM'
export const localeTimeComparator = (time1, time2) => {
  return getMilitaryTime(time1).localeCompare(getMilitaryTime(time2));
};

export const localeTimeRangeComparator = (range1, range2) => {
  const [start1, end1] = range1.split('-');
  const [start2, end2] = range2.split('-');

  const startDiff = localeTimeComparator(start1, start2);
  const endDiff = localeTimeComparator(end1, end2);

  // Return end difference if starts are the same
  return startDiff === 0 ? endDiff : startDiff;
};

/**
 * Helper function to create a string of hosts' names.
 * @param hostinfo - an array of hosts
 * @returns a string of hosts' names.
 */
export function createHostNamesStr(hostInfo) {
  const length = hostInfo.length;
  let hostNames = '';

  if (length === 1) {
    hostNames = hostInfo[0].name || hostInfo[0];
  } else if (length === 2) {
    hostNames =
      (hostInfo[0].name || hostInfo[0]) +
      ' and ' +
      (hostInfo[1].name || hostInfo[1]);
  } else {
    for (let i = 0; i < length - 1; i++) {
      hostNames += (hostInfo[i].name || hostInfo[i]) + ', ';
    }
    hostNames += 'and ' + (hostInfo[length - 1].name || hostInfo[length - 1]);
  }

  return hostNames;
}

/**
 * Helper function to get the time in milliseconds.
 * @param time - a hh:mm:ss string
 * @returns time in milliseconds.
 */
export function getTimeInMS(time) {
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
 * Helper function to get the semester collection.
 * @returns an array of semester objects.
 */
export const getSemesterCollection = () => [
  { id: '1', title: 'Spring' },
  { id: '2', title: 'Summer' },
  { id: '3', title: 'Fall' },
  { id: '4', title: 'Winter' },
];

/**
 * Helper function to check whether a semester is valid.
 * @param {String} semester - a string representing the semester
 * @param {Number} year - the year as Number data type
 * @returns whether or not the semester is valid.
 */
export function isSemesterBeforeNow(semester, year) {
  const now = new Date();

  let semesterObj = new Date();

  if (semester === 'Fall') {
    semesterObj = new Date(`${year}-12-07`);
  } else if (semester === 'Winter') {
    semesterObj = new Date(`${year}-01-22`);
  } else if (semester === 'Summer') {
    semesterObj = new Date(`${year}-08-18`);
  } else if (semester === 'Spring') {
    semesterObj = new Date(`${year}-04-30`);
  }

  if (now.getTime() < semesterObj.getTime()) {
    return true;
  }

  return false;
}

/**
 * Retrieves the string representation of the day.
 * @param {Number} day - a Number representing the day
 * @returns the string associated with the day.
 */
export function getStrFromDayNum(day) {
  if (day === 0) {
    return 'Sunday';
  } else if (day === 1) {
    return 'Monday';
  } else if (day === 2) {
    return 'Tuesday';
  } else if (day === 3) {
    return 'Wednesday';
  } else if (day === 4) {
    return 'Thursday';
  } else if (day === 5) {
    return 'Friday';
  }
  return 'Saturday';
}

/**
 * When given a yyyy-mm-dd string, return the correct date since
 * Date objects always do one day forward.
 * @param {string} stringDate - a string representing the date
 * @returns a Date object.
 */
export function getDate(stringDate) {
  const [year, month, day] = stringDate.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// View Courses

// Helper function handle color changes when the student/staff tab is selected.
export function changeTab(
  newValue,
  setTab,
  setColorStudentText,
  setBgColorStudent,
  setColorStaffText,
  setBgColorStaff,
) {
  setTab(newValue);
  if (newValue === 'student') {
    setColorStudentText('white');
    setBgColorStudent('primary.main');
    setColorStaffText('black');
    setBgColorStaff('white');
  } else {
    setColorStudentText('black');
    setBgColorStudent('white');
    setColorStaffText('white');
    setBgColorStaff('primary.main');
  }
}
