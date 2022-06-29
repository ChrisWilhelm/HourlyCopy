const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');

/**
 * checks the office hour is available given seats
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isAvailable = async (req, res, next) => {
  const { officehourid, maxseats } = req.officeHour;
  if (maxseats !== null || maxseats !== undefined) {
    const registrations = await query(
      'SELECT getRegistrationsForOfficeHours($1)',
      [officehourid],
    );
    const numRegistrations = registrations.rowCount
      ? registrations.rowCount
      : 0;
    if (numRegistrations >= maxseats) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: 'All seats have been taken!' });
    }
  }
  next();
};

/**
 * checks if the user is already registered
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isNotRegistered = async (req, res, next) => {
  const { id: officeHourId } = req.params;
  const { date } = req.body;
  const studentId = req.user.id;
  const isNotRegistered = await query(
    'SELECT studentIsNotAlreadyRegistered($1, $2, $3)',
    [officeHourId, date, studentId],
  );
  if (!isNotRegistered.rows[0].studentisnotalreadyregistered) {
    res.status(StatusCodes.NOT_ACCEPTABLE).json({
      msg: 'ERROR: Student is already registered for given office hour',
    });
  } else {
    next();
  }
  return res;
};

module.exports.accountMatchRegistration = async (req, res, next) => {
  const { id } = req.user;
  const { registrationId } = req.params;
  const registration = await query(
    'SELECT * FROM registration WHERE registrationId = $1',
    [registrationId],
  );
  if (registration.rows === undefined || registration.rows.length === 0) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: This is not a valid registrationId' });
  } else if (registration.rows[0].accountid.toString() !== id) {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: 'ERROR: user does not have access to this registration' });
  } else {
    next();
  }
  return res;
};
