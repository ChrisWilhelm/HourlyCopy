const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');
const catchAsync = require('../utils/catchAsync');

/**
 * checks the end date is after the current
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isEndAfter = (req, res, next) => {
  const { startDate, endDate } = req.body;
  // HH:MM:SS
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end.getTime() < start.getTime()) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: end date is before start' });
  } else {
    next();
  }
};

/**
 * checks the current date is before the start
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isDateAfterStart = (req, res, next) => {
  const date = new Date(req.body.date);
  const { startdate: start } = req.officeHour;
  date.setUTCHours(0, 0, 0, 0);
  start.setUTCHours(0, 0, 0, 0);
  if (date < start) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Given date can not be before start date' });
  } else {
    next();
  }
  return res;
};

/**
 * checks that the date and time is after the current date and time
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isAfterNow = (req, res, next) => {
  const { date } = req.body;
  try {
    const dateObj = new Date(date);
    const now = new Date();
    if (dateObj <= now) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'ERROR: enter a valid date for the future' });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
  return res;
};

/**
 * checks if it is at least a hour before office hours
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isCancelOneHourOut = (req, res, next) => {
  const now = new Date();
  const { officeHour } = req;
  const start = req.body.date ? req.body.date : req.params.date;
  const startDate = new Date(start);
  const times = officeHour.starttime.split(':');
  startDate.setUTCHours(times[0], times[1], times[2]);
  now.setHours(now.getHours + 1);
  if (now.getTime() > startDate.getTime()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'The office hours is within an hour of its start, and cannot be cancelled',
    });
  } else {
    next();
  }
  return res;
};

/**
 * checks it is a future office hour
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isAfterYesterday = (req, res, next) => {
  const { date } = req.body;
  // YYYY-MM-DD
  try {
    const now = new Date();
    const dateObj = new Date(date);
    if (dateObj <= now) {
      res
        .status(400)
        .json({ msg: 'ERROR: Can only cancel future office hours' });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
  return res;
};

/**
 * checks if office hour is on date given
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isOhOnDate = catchAsync(async (req, res, next) => {
  let { date } = req.body;
  if (date === undefined) {
    date = req.params.date;
  }
  const {
    officehourid: id,
    startdate: startDate,
    enddate: endDate,
    starttime,
    endtime,
  } = req.officeHour;
  const regStartTime = req.body.startTime.split(':');
  const starttimes = starttime.split(':');
  const endtimes = endtime.split(':');
  startDate.setUTCHours(starttimes[0], starttimes[1], starttimes[2]);
  endDate.setUTCHours(endtimes[0], endtimes[1], endtimes[2]);
  const dateObj = new Date(date);
  dateObj.setUTCHours(regStartTime[0], regStartTime[1], regStartTime[2]);
  if (startDate > dateObj || endDate < dateObj) {
    return res.status(400).json({
      msg: 'ERROR: Date is not within scheduled start and end date of office hour',
    });
  }
  const isOnDate = await query('SELECT isOfficeHoursOnDay($1, $2)', [id, date]);

  if (!isOnDate.rows[0].isofficehoursonday) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: office hours not hosted on this date' });
  } else {
    next();
  }
  return res;
});

/**
 * checks if the office hour is cancelled on the given date
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isOhOnDateCancel = catchAsync(async (req, res, next) => {
  const date = req.body.date ? req.body.date : req.params.date;
  const {
    officehourid: id,
    startdate: startDate,
    enddate: endDate,
    starttime,
    endtime,
  } = req.officeHour;
  const starttimes = starttime.split(':');
  const endtimes = endtime.split(':');
  startDate.setUTCHours(starttimes[0], starttimes[1], starttimes[2]);
  endDate.setUTCHours(endtimes[0], endtimes[1], endtimes[2]);
  const isOnDate = await query('SELECT isOfficeHoursOnDay($1, $2)', [id, date]);

  if (!isOnDate.rows[0].isofficehoursonday) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: office hours not hosted on this date' });
  } else {
    next();
  }
  return res;
});

/**
 * checks if it is a valid non recurring office hour
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isValidNonrecurring = (req, res, next) => {
  const { recurringEvent, startDate, endDate } = req.body;

  try {
    if (!recurringEvent && startDate !== endDate) {
      res.status(StatusCodes.NOT_ACCEPTABLE).json({
        msg: 'ERROR: office hours must start and end on the same date if not recurring',
      });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
  return res;
};
