const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const checkValidation = require('../utils/checkValidation');
const { query } = require('../config/db');

/**
 * request to create an office hour
 * @param {object} req - request to create the office hour
 * @param {object} res - response to the request
 */
exports.create = catchAsync(async (req, res) => {
  checkValidation(req);
  const {
    startTime,
    endTime,
    recurringEvent,
    startDate,
    endDate,
    location,
    courseId,
    timeInterval,
    hosts,
    daysOfWeek,
  } = req.body;
  // Create Office Hour
  const queryOfficeHour = await query(
    'SELECT createOfficeHourTimeInterval($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      startTime,
      endTime,
      recurringEvent,
      startDate,
      endDate,
      location,
      courseId,
      timeInterval,
    ],
  );
  const officeHourId = queryOfficeHour.rows[0].createofficehourtimeinterval;
  // Add Day of the Week(s)
  await daysOfWeek.forEach(async (day) => {
    await query('SELECT addDayOfWeek($1, $2)', [officeHourId, day]);
  });
  // Add Host(s)
  await hosts.forEach(async (host) => {
    await query('SELECT addHost($1, $2)', [officeHourId, host]);
  });
  // Get full info of new office hours
  const officeHour = await query('SELECT * from getOfficeHoursById($1)', [
    officeHourId,
  ]);
  res.status(StatusCodes.CREATED).json({ officeHour: officeHour.rows[0] });
});

/**
 * request to delete an office hour
 * @param {object} req - request to delete the office hour
 * @param {object} res - response to the request
 */
exports.delete = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id } = req.params;
  await query('DELETE FROM officeHour where officeHourId = $1', [id]);
  res
    .status(StatusCodes.OK)
    .json({ msg: 'All sessions of given office hour has been deleted' });
});

/**
 * request to cancel an office hour
 * @param {object} req - request to cancel the office hour
 * @param {object} res - response to the request
 */
exports.cancel = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id, date } = req.params;
  const cancelledOH = await query('SELECT cancelOfficeHour($1, $2)', [
    id,
    date,
  ]);
  res
    .status(StatusCodes.CREATED)
    .json({ officeHour: cancelledOH.rows[0].cancelofficehour });
});

/**
 * request to cancel all future office hour
 * @param {object} req - request to cancel the office hour
 * @param {object} res - response to the request
 */
exports.cancelFollowing = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id, date } = req.params;

  const newEndDate = new Date(date);
  await query('UPDATE officeHour SET endDate = $1 WHERE officeHourId = $2', [
    newEndDate,
    id,
  ]);
  const updatedOH = await query(
    'SELECT * FROM officeHour WHERE officeHourId = $1',
    [id],
  );
  res.status(StatusCodes.OK).json({ officeHour: updatedOH.rows[0] });
});

/**
 * request to register for an office hour
 * @param {object} req - request to register for the office hour
 * @param {object} res - response to the request
 */
exports.register = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id: officeHourId } = req.params;
  const { startTime, endTime, questions, date, topicTagIds } = req.body;
  const { id } = req.user;

  const registration = await query(
    'SELECT createRegistration($1, $2, $3, $4, $5)',
    [id, startTime, endTime, date, officeHourId],
  );
  const registrationId = registration.rows[0].createregistration;
  await questions.forEach(async (question) => {
    await query('SELECT addOfficeHourQuestions($1, $2)', [
      registrationId,
      question,
    ]);
  });

  if (topicTagIds) {
    await topicTagIds.forEach(async (topicId) => {
      await query('SELECT addTopicToRegistration($1, $2)', [
        registrationId,
        topicId,
      ]);
    });
  }

  res.status(StatusCodes.CREATED).json({ msg: registrationId });
});

/**
 * request to get the office hours
 * @param {object} req - request to get the office hours
 * @param {object} res - response to the request
 */
exports.get = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id: courseId } = req.params;
  const officeHours = await query(
    'SELECT * from getofficehoursforcoursewithinfo($1)',
    [courseId],
  );
  res.status(StatusCodes.OK).json({ officeHours: officeHours.rows });
});

/**
 * request to get the registrations
 * @param {object} req - request to get the registrations for an office hour
 * @param {object} res - response to the request
 */
exports.getRegistrations = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id } = req.params;
  const registrations = await query(
    'SELECT * from getRegistrationsForOfficeHours($1)',
    [id],
  );
  res.status(StatusCodes.OK).json({ registrations: registrations.rows });
});

/**
 * request to get the questions for an office hour on a date
 * @param {object} req - request to get the questions
 * @param {object} res - response to the request
 */
exports.getQuestions = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id, date } = req.params;
  const questions = await query(
    'SELECT * from getOfficeHourQuestionsByDate($1, $2)',
    [id, date],
  );
  res.status(StatusCodes.OK).json({ questions: questions.rows });
});

/**
 * request to get the available times for an office hour
 * @param {object} req - request to get the available times for an office hour
 * @param {object} res - response to the request
 */
exports.getTimes = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id, date } = req.params;
  const times = await query('SELECT * FROM getAvailableIntervals($1, $2)', [
    id,
    date,
  ]);
  res.status(StatusCodes.OK).json({ times: times.rows });
});
