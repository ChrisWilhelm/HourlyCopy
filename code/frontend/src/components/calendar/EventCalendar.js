import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import SessionInfo from '../session-info/SessionInfo';
import { createHostNamesStr } from '../../utils/helpers/helpers';

/**
 * Represents a Calendar to view office hours sessions.
 * @param {*}.
 * @returns A calendar.
 */
function EventCalendar(props) {
  const { officeHours, view, token, course, open, setOpen, accountid } = props;
  const colors = ['#4169E1', '#2E8B57', '#DC143C', '#663399'];
  const localizer = momentLocalizer(moment);

  const [calendarView, setView] = useState('week');
  const [eventList, setEventList] = useState([]);
  const [officeHour, setOfficeHour] = useState();
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const getHours = (time) => {
    const hours = time.substring(0, 2);
    return parseInt(hours);
  };

  const getMinutes = (time) => {
    const minutes = time.substring(3);
    return parseInt(minutes);
  };

  const setDateWithTime = (day, time) => {
    const date = new Date(day);
    date.setHours(getHours(time));
    date.setMinutes(getMinutes(time));
    return date;
  };

  useEffect(() => {
    const events = [];
    let id = 0;
    officeHours.forEach((officeHour) => {
      const title = createHostNamesStr(officeHour.hostname) + "'s Office Hours";
      const { startdate, starttime, endtime } = officeHour;
      const start = setDateWithTime(startdate, starttime);
      const end = setDateWithTime(startdate, endtime);
      const event = {
        id: id,
        title: title,
        start: start,
        end: end,
        officeHour: officeHour,
      };
      events.push(event);
      id++;
    });
    setEventList(events);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeHours, open]);

  const eventStyleGetter = (event, start, end, isSelected) => {
    const backgroundColor = colors[event.officeHour.officehourid % 4];
    const style = {
      backgroundColor: backgroundColor,
      display: 'block',
    };
    return {
      style: style,
    };
  };

  const onSelectEvent = (event) => {
    setOfficeHour(event.officeHour);
    setTitle(event.title);
    setStart(event.officeHour.starttime);
    setEnd(event.officeHour.endtime);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={eventList}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '79vh', margin: '20px', width: '90.5vw' }}
        onView={(v) => {
          setView(v);
        }}
        onSelectEvent={(event) => onSelectEvent(event)}
        views={['month', 'week', 'day']}
        view={calendarView}
        step={60}
        timeslots={2}
        eventPropGetter={eventStyleGetter}
      />
      {open && (
        <SessionInfo // Temp fix!
          open={open}
          onClose={handleClose}
          view={view}
          course={course}
          officeHour={officeHour}
          title={title}
          start={start}
          end={end}
          token={token}
          accountid={accountid}
        />
      )}
    </div>
  );
}

export default EventCalendar;
