const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');

/**
 * checks if the user is in the queue
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isUserNotInQueue = async (req, res, next) => {
  const { id: officeHourId, date } = req.params;
  const studentId = req.user.id;
  const isInQueue = await query('SELECT isstudentinqueue($1, $2, $3)', [
    studentId,
    officeHourId,
    date,
  ]);
  if (isInQueue.rows[0].isStudentInQueue) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .json({ msg: 'ERROR: student is in the queue already' });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the student is in the queue
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isStudentInQueue = async (req, res, next) => {
  const { id: officeHourId, accountId: studentId } = req.params;
  const date = req.body.date ? req.body.date : req.params.date;
  const isInQueue = await query('SELECT isstudentinqueue($1, $2, $3)', [
    studentId,
    officeHourId,
    date,
  ]);
  if (!isInQueue.rows[0].isstudentinqueue) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .json({ msg: 'ERROR: student is not in the queue' });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the student is on the waitlist
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isStudentOnWaitlist = async (req, res, next) => {
  const { id: officeHourId, date } = req.params;
  const studentId = req.user.id;
  const onwaitist = await query('SELECT isstudentonwaitlist($1, $2, $3)', [
    studentId,
    officeHourId,
    date,
  ]);
  if (onwaitist.rows[0].isStudentOnWaitlist) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: student is already on waitlist' });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the student passed in param is on the waitlist
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isOnWaitlist = async (req, res, next) => {
  const { id: officeHourId, date, accountId } = req.params;
  const onwaitist = await query('SELECT isstudentonwaitlist($1, $2, $3)', [
    accountId,
    officeHourId,
    date,
  ]);
  if (!onwaitist.rows[0].isStudentOnWaitlist) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Student is not on waitlist' });
  } else {
    next();
  }
  return res;
};
