import { Divider, ListItem, ListItemText } from '@mui/material';
import Controls from '../reusable/controls/Controls';
import { Link } from 'react-router-dom';
import { createHostNamesStr, getLocaleTime } from '../../utils/helpers/helpers';

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
 * Represents a Material UI ListItem component that helps to display list items for
 * the MyPage component.
 * @param {*} props - Properties include type, session, option, setId, setOpen, setDate, setCancel
 * @returns A list item for "My Registrations" and "My Office Hours" pages.
 */
function MyPageItem(props) {
  const {
    type,
    session,
    course,
    option,
    setId,
    setOpen,
    setDate,
    setCancel,
    setStartTime,
    setEndTime,
  } = props;

  /**
   * Helper function to see if the office hour is currently taking place
   * Needed to determine if the 'View Queue' button should appear
   * @returns true if it is in session, and false otherwise
   */
  const isOfficeHourInSession = () => {
    let startDateInMS;
    let startDateAndTime;
    if (type === 'registration') {
      startDateInMS = new Date(session.ohdate).getTime();
      startDateAndTime = new Date(
        startDateInMS + getTimeInMS(session.officehourstarttime),
      );
    } else {
      startDateInMS = session.startdate.getTime();
      startDateAndTime = new Date(
        startDateInMS + getTimeInMS(session.starttime),
      );
    }
    const endDateAndTime = new Date(
      startDateInMS + getTimeInMS(session.endtime),
    );

    const todaysDate = new Date();
    return todaysDate >= startDateAndTime && todaysDate < endDateAndTime;
  };

  const primary =
    session.hostinfo === undefined
      ? ''
      : createHostNamesStr(session.hostinfo) + "'s Office Hours";
  const date =
    type === 'office'
      ? 'Date: ' + new Date(session.startdate).toDateString()
      : 'Date: ' + new Date(session.ohdate).toDateString();
  const time =
    'Time: ' +
    getLocaleTime(session.starttime) +
    ' - ' +
    getLocaleTime(session.endtime);
  const location = 'Location: ' + session.ohlocation;

  let text;
  if (type === 'registration' && option === 'Upcoming') {
    text = 'Cancel';
  } else if (type === 'registration' && option === 'Past') {
    text = 'Leave Feedback';
  } else {
    text = 'See Details';
  }

  const onClick = () => {
    if (type === 'registration') {
      setId(session.registrationid);
    } else {
      setId(session.officehourid);
      const date = new Date(session.startdate);
      setDate(date.toISOString().split('T')[0]);
      setStartTime(getLocaleTime(session.starttime));
      setEndTime(getLocaleTime(session.endtime));
    }
    setOpen(true);
  };

  const leaveFeedback = () => {
    setId(session.registrationid);
    setOpen(true);
  };

  const onCancel = () => {
    setId(session.officehourid);
    const date = new Date(session.startdate);
    setDate(date.toISOString().split('T')[0]);
    setCancel(true);
  };

  return (
    <>
      <ListItem>
        <ListItemText
          primary={
            primary === '' ? (
              <>
                {date}
                <br />
                {time}
                <br />
                {location}
              </>
            ) : (
              primary
            )
          }
          secondary={
            primary !== '' ? (
              <>
                {date}
                <br />
                {time}
                <br />
                {location}
              </>
            ) : null
          }
        />
        {type === 'office' && isOfficeHourInSession(session) && (
          <Link
            to="/queue"
            state={{
              id: session.officehourid,
              date: session.startdate,
              role: 'host',
              course: course,
            }}
          >
            <Controls.Button text="View Queue" edge="end" size="small" />
          </Link>
        )}
        {type === 'registration' && isOfficeHourInSession(session) && (
          <Link
            to="/queue"
            state={{
              id: session.officehourid,
              date: new Date(session.ohdate),
              role: 'student',
              accountid: session.accountid,
              course: course,
            }}
          >
            <Controls.Button text="View Queue" edge="end" size="small" />
          </Link>
        )}
        <Controls.Button
          text={text}
          edge="end"
          size="small"
          onClick={
            type === 'registration' && option === 'Past'
              ? leaveFeedback
              : onClick
          }
        />
        {type === 'office' && option === 'Upcoming' && (
          <Controls.Button
            text="Cancel"
            edge="end"
            size="small"
            color="secondary"
            onClick={onCancel}
          />
        )}
      </ListItem>
      <Divider />
    </>
  );
}

export default MyPageItem;
