const { StatusCodes } = require('http-status-codes');
const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');

/**
 * request to cancel an office hour registration
 * @param {object} req - request to cancel registration
 * @param {object} res - response to the request
 */
exports.cancel = catchAsync(async (req, res) => {
  const { rid } = req.params;
  // Anyone can cancel anyone's office hours

  // Set isCancelled to 1 and return the updated row
  const { rows } = await db.query(
    'UPDATE registration SET iscancelled = True WHERE registrationid = $1 RETURNING *',
    [rid],
  );

  // If there was a DB error, rows[0] will cause internal server error
  // and send status code 500
  res.json({ registration: rows[0] });
});

/**
 * request to get if registered
 * @param {object} req - request
 * @param {object} res - response to the request
 */
exports.isRegistered = catchAsync(async (req, res) => {
  const { date, id } = req.params;
  const { id: userId } = req.user;
  const isRegistered = await db.query(
    'SELECT * FROM registration WHERE officeHourId = $1 AND ohdate = $2 AND accountId = $3 AND isCancelled = false AND registrationId NOT IN (SELECT n.registrationId FROM noShow as n)',
    [id, date, userId],
  );
  if (isRegistered.rows === undefined || isRegistered.rows.length === 0) {
    res.status(StatusCodes.ACCEPTED).json({ isRegistered: false });
  } else {
    res
      .status(StatusCodes.ACCEPTED)
      .json({ isRegistered: true, registration: isRegistered.rows[0] });
  }
});
