const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const checkValidation = require('../utils/checkValidation');
const notifController = require('./notifController');
const { query } = require('../config/db');

/**
 * request to get the queue for an office hour (staff)
 * @param {object} req - request to get the queue
 * @param {object} res - response to the request
 */
exports.getQueue = catchAsync(async (req, res) => {
  checkValidation(req);

  const { id: officeHourId } = req.params;
  const { date } = req.params;
  const queueExists = await query('SELECT isQueueGenerated($1, $2)', [
    officeHourId,
    date,
  ]);
  let queue;
  if (!queueExists.rows[0].isqueuegenerated) {
    queue = await query('SELECT * FROM generateQueue($1, $2)', [
      officeHourId,
      date,
    ]);
  }
  queue = await query('SELECT * FROM getQueue($1, $2)', [officeHourId, date]);
  const noshow = await query('SELECT * FROM getNoShow($1, $2)', [
    officeHourId,
    date,
  ]);
  const waitlist = await query('SELECT * FROM getWaitlist($1, $2)', [
    officeHourId,
    date,
  ]);
  res
    .status(StatusCodes.OK)
    .json({ queue: queue.rows, noshow: noshow.rows, waitlist: waitlist.rows });
});

/**
 * request to add user to the waitlist
 * @param {object} req - request to add to the waitlist
 * @param {object} res - response to the request
 */
exports.addToWaitlist = catchAsync(async (req, res) => {
  checkValidation(req);

  const { id: officeHourId } = req.params;
  const { date } = req.body;
  const studentId = req.user.id;
  const newWaitlistAddition = await query(
    'SELECT * FROM joinWaitlist($1, $2, $3)',
    [studentId, officeHourId, date],
  );
  res.status(StatusCodes.OK).json({ newStudent: newWaitlistAddition.rows });
});

/**
 * request to move a user to the no show list
 * @param {object} req - request to move to no show
 * @param {object} res - response to the request
 */
exports.addToNoShow = catchAsync(async (req, res) => {
  checkValidation(req);
  const { registrationId } = req.body;
  const moveToNoShow = await query('SELECT * FROM transferToNoShow($1)', [
    registrationId,
  ]);

  const registration = await query(
    'SELECT * from allInfoFromRegistration($1)',
    [1],
  );
  notifController.addToNoShow(registration.rows[0]);

  res.status(StatusCodes.OK).json({ newNoShow: moveToNoShow.rows });
});

/**
 * request to remove a user from the queue
 * @param {object} req - request to remove from the queue
 * @param {object} res - response to the request
 */
exports.removeFromQueue = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id: officeHourId, accountId } = req.params;
  const registrationQuery = await query(
    'SELECT * FROM registration WHERE accountId = $1 AND officeHourId = $2',
    [accountId, officeHourId],
  );
  const removeFromQueue = await query('SELECT removeFromQueue($1)', [
    registrationQuery.rows[0].registrationid,
  ]);
  if (!removeFromQueue.rows[0].removefromqueue) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: student was not at the top of the queue' });
  } else {
    const registration = await query(
      'SELECT * from allInfoFromRegistration($1)',
      [1],
    );
    notifController.removeFromQueue(registration.rows[0]);

    res.status(StatusCodes.OK).json({ msg: 'Student removed from queue' });
  }
});

/**
 * request to remove from the waitlist
 * @param {object} req - request to remove from the waitlist
 * @param {object} res - response to the request
 */
exports.removeSelfFromWaitlist = catchAsync(async (req, res) => {
  checkValidation(req);
  // const studentId = req.user.id;
  const { id: officeHourId, date, accountId } = req.params;
  const removePosition = await query('SELECT removeFromWaitlist($1, $2, $3)', [
    accountId,
    officeHourId,
    date,
  ]);
  res.status(StatusCodes.OK).json({ position: removePosition.rows[0] });
});

/**
 * request to move the top of the waitlist to the back
 * @param {object} req - request to shift the waitlist
 * @param {object} res - response to the request
 */
exports.moveTopToBack = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id: officeHourId } = req.params;
  const { date } = req.body;
  const removePosition = await query('SELECT moveToBackOfWaitlist($1, $2)', [
    officeHourId,
    date,
  ]);
  res
    .status(StatusCodes.OK)
    .json({ position: removePosition.rows[0].movetobackofwaitlist });
});

/**
 * request to get the queue for an office hour (student)
 * @param {object} req - request to get the queue
 * @param {object} res - response to the request
 */
exports.getStudentQueue = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id: officeHourId } = req.params;
  const { date } = req.params;
  const accountId = req.user.id;
  const queueExists = await query('SELECT isQueueGenerated($1, $2)', [
    officeHourId,
    date,
  ]);
  if (!queueExists.rows[0].isqueuegenerated) {
    res
      .status(StatusCodes.NO_CONTENT)
      .json({ msg: 'The queue is yet to be generated for this office hours' });
  } else {
    const queue = await query('SELECT * FROM getQueueStudent($1, $2, $3)', [
      officeHourId,
      date,
      accountId,
    ]);
    const waitlist = await query(
      'SELECT * FROM getWaitlistStudentView($1, $2, $3)',
      [officeHourId, date, accountId],
    );
    res
      .status(StatusCodes.OK)
      .json({ queue: queue.rows, waitlist: waitlist.rows });
  }
});

/**
 * request to get the queue's status (started or not)
 * @param {object} req - request to get the queue status
 * @param {object} res - response to the request
 */
exports.getQueueStatus = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id: officeHourId } = req.params;
  const { date } = req.params;
  const queueExists = await query('SELECT isQueueGenerated($1, $2)', [
    officeHourId,
    date,
  ]);
  res
    .status(StatusCodes.OK)
    .json({ isStarted: queueExists.rows[0].isqueuegenerated });
});

/**
 * request to get if student is on waitlist
 * @param {object} req - request to see if on waitlist
 * @param {object} res - response to the request
 */
exports.isOnWaitlist = catchAsync(async (req, res) => {
  const { id: officeHourId, date } = req.params;
  const studentId = req.user.id;
  const onwaitist = await query('SELECT isstudentonwaitlist($1, $2, $3)', [
    studentId,
    officeHourId,
    date,
  ]);
  res
    .status(StatusCodes.OK)
    .json({ onWaitlist: onwaitist.rows[0].isstudentonwaitlist });
});
