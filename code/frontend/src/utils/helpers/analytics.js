import { fetchAndSetRows } from '../requests/analytics';
import {
  dayOfWeekComparator,
  getLocaleTime,
  localeTimeRangeComparator,
} from './helpers';

/**
 * Helper function to generate the rows based on topic - registration
 * data.
 * @param option - an array of row data
 * @returns an array of topic - registration data that can be passed
 * to the DataTable component.
 */
export function getTopics(rows) {
  return rows.map((row, i) => {
    return {
      id: i,
      topic: row.topictag,
      numRegistrations: row.numregistrations,
    };
  });
}

/**
 * Helper function to generate the rows based on student - registration
 * data.
 * @param option - an array of row data
 * @returns an array of student - registration data that can be passed
 * to the DataTable component.
 */
export function getStudents(rows) {
  return rows.map((row, i) => {
    return {
      id: i,
      student: row.username,
      numRegistrations: row.count,
    };
  });
}

/**
 * Helper function to generate the certain columns based on which option
 * is selected for the Analytics Page.
 * @param option - a string representing a specific view of the page
 * @returns an array of columns.
 */
export function getColumns(option) {
  let columns = [];

  if (option === 'Topics') {
    columns = [
      { field: 'topic', headerName: 'Topic', flex: 1 },
      {
        field: 'numRegistrations',
        headerName: '# Registrations',
        align: 'right',
        headerAlign: 'right',
        flex: 1,
      },
    ];
  } else if (option === 'Students') {
    columns = [
      { field: 'student', headerName: 'Student', flex: 1 },
      {
        field: 'numRegistrations',
        headerName: '# Registrations',
        align: 'right',
        headerAlign: 'right',
        flex: 1,
      },
    ];
  } else if (option === 'Sessions') {
    columns = [
      {
        field: 'dayOfWeek',
        headerName: 'Day Of Week',
        sortComparator: dayOfWeekComparator,
        flex: 1,
      },
      {
        field: 'time',
        headerName: 'Time',
        sortComparator: localeTimeRangeComparator,
        flex: 1,
      },
      {
        field: 'hosts',
        headerName: 'Host(s)',
        flex: 1,
      },
      {
        field: 'numRegistrations',
        headerName: '# Registrations',
        align: 'right',
        headerAlign: 'right',
        flex: 1,
      },
    ];
  }

  return columns;
}

/**
 * Helper function to generate the rows based on times.
 * @param option - an array of row data
 * @returns an array of time - registration data that can be passed
 * to the DataTable component.
 */
export function getTimes(rows) {
  return rows.map((row, i) => {
    return {
      id: i,
      time: `${getLocaleTime(row.starttime)}-${getLocaleTime(row.endtime)}`,
      numRegistrations: row.count,
    };
  });
}

/**
 * Helper function to generate the rows based on host - registration
 * data.
 * @param option - an array of row data
 * @returns an array of host - registration data that can be passed
 * to the DataTable component.
 */
export function getHosts(rows) {
  return rows.map((row, i) => {
    return {
      id: i,
      host: row.username,
      numRegistrations: row.count,
    };
  });
}

// Helper function to fetch and set the rows for AnalyticsGraph.
export function fetchAndSetRowsGraph(
  option,
  token,
  course,
  setRows,
  setXDataKey,
  setXAxisLabel,
  sessionIV,
) {
  if (option === 'Topics') {
    fetchAndSetRows(
      token,
      `/api/courses/${course.courseid}/topicTags`,
      'numRegistrations',
      getTopics,
      setRows,
    );
    setXDataKey('topic');
    setXAxisLabel('Topic');
  } else if (option === 'Students') {
    fetchAndSetRows(
      token,
      `/api/courses/${course.courseid}/registrations/count`,
      'counts',
      getStudents,
      setRows,
    );
    setXDataKey('student');
    setXAxisLabel('Student');
  } else if (option === 'Sessions' && sessionIV === 'times') {
    fetchAndSetRows(
      token,
      `api/courses/${course.courseid}/registrations/count/byTime`,
      'counts',
      getTimes,
      setRows,
    );
    setXDataKey('time');
    setXAxisLabel('Time Period');
  } else {
    fetchAndSetRows(
      token,
      `api/courses/${course.courseid}/registrations/count/staff`,
      'counts',
      getHosts,
      setRows,
    );
    setXDataKey('host');
    setXAxisLabel('Host');
  }
}

// Helper function to fetch and set the rows for AnalyticsTable.
export function fetchAndSetRowsTable(token, option, course, setRows) {
  if (option === 'Topics') {
    fetchAndSetRows(
      token,
      `/api/courses/${course.courseid}/topicTags`,
      'numRegistrations',
      getTopics,
      setRows,
    );
  } else if (option === 'Students') {
    fetchAndSetRows(
      token,
      `/api/courses/${course.courseid}/registrations/count`,
      'counts',
      getStudents,
      setRows,
    );
  } else {
    fetchAndSetRows(
      token,
      `api/courses/${course.courseid}/registrations/count/byOfficeHour/perDayOfWeek`,
      'counts',
      getSessions,
      setRows,
    );
  }
}

/* Helper function to generate the rows based on session - registration
 * data.
 * @param option - an array of row data
 * @returns an array of session - registration data that can be passed
 * to the DataTable component.
 */
export function getSessions(rows) {
  return rows.map((row, i) => {
    return {
      id: i,
      dayOfWeek: row.dayofweek,
      time: `${getLocaleTime(row.starttime)}-${getLocaleTime(row.endtime)}`,
      hosts: row.hostnames.join(),
      numRegistrations: row.count,
    };
  });
}
