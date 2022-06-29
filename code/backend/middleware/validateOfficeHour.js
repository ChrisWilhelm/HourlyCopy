const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');

/**
 * checks if office hour does not conflict
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isNotConflictingOfficeHour = async (req, res, next) => {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    recurringEvent,
    daysOfWeek,
    courseId,
    hosts,
  } = req.body;

  let isConflicting = false;
  try {
    /* eslint-disable no-restricted-syntax */
    for (const hostId of hosts) {
      /* eslint-disable no-await-in-loop */
      const isValid = await query(
        'SELECT isOfficeHoursSchedulingValid($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          startDate,
          endDate,
          startTime,
          endTime,
          recurringEvent,
          daysOfWeek,
          courseId,
          hostId,
        ],
      );
      if (!isValid.rows[0].isofficehoursschedulingvalid) {
        isConflicting = true;
        break;
      }
    }
  } catch {
    isConflicting = true;
  }

  if (isConflicting) {
    res.status(StatusCodes.CONFLICT).json({
      msg: 'ERROR: One or more of the hosts have a conflicting office hour',
    });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the office hour is cancelled
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isNotCancelled = async (req, res, next) => {
  const { id } = req.params;
  const date = req.body.date ? req.body.date : req.params.date;
  const isCancelled = await query(
    'SELECT isOfficeHoursCancelledOnDate($1, $2)',
    [id, date],
  );
  if (isCancelled.rows[0].isofficehourscancelledondate) {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: 'ERROR: office hours is cancelled on given day' });
  } else {
    next();
  }
  return res;
};
