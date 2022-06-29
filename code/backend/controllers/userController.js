const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkValidation = require('../utils/checkValidation');

/**
 * request to update a users account
 * @param {object} req - request to update account
 * @param {object} res - response to the request
 */
exports.updateMyUser = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id } = req.user;
  const { phoneNumber } = req.body;
  const updatedId = await query('SELECT updateUserPhoneNumber($1, $2)', [
    id,
    phoneNumber,
  ]);
  const user = await query(
    'SELECT a.accountId, a.uName, a.email, a.phoneNumber FROM account as a WHERE a.accountId = $1',
    [updatedId.rows[0].updateuserphonenumber],
  );
  res.status(StatusCodes.OK).json(user.rows[0]);
});

/**
 * request to get current user info
 * @param {object} req - request
 * @param {object} res - response to the request
 */
exports.getMyUser = catchAsync(async (req, res) => {
  const { id } = req.user;
  const user = await query(
    'SELECT a.accountId, a.uName, a.email, a.phoneNumber FROM account as a WHERE a.accountId = $1',
    [id],
  );
  res.status(StatusCodes.OK).json(user.rows[0]);
});

/**
 * request to get current users courses
 * @param {object} req - request
 * @param {object} res - response to the request
 */
exports.getMyCourses = catchAsync(async (req, res) => {
  const { id } = req.user;
  const myStudentCourses = await query('SELECT * FROM getStudentCourses($1)', [
    id,
  ]);
  const myStaffCourses = await query('SELECT * FROM getStaffCourses($1)', [id]);
  res.status(StatusCodes.OK).json({
    courses: {
      asStudent: myStudentCourses.rows,
      asStaff: myStaffCourses.rows,
    },
  });
});

/**
 * request to get current users registrations
 * @param {object} req - request
 * @param {object} res - response to the request
 */
exports.getMyRegistrations = catchAsync(async (req, res) => {
  const { id } = req.user;
  const registrations = await query('SELECT * FROM getUserRegistration($1)', [
    id,
  ]);
  res.status(StatusCodes.OK).json({
    registrations: registrations.rows,
  });
});

/**
 * request to get users registrations for a course
 * @param {object} req - request
 * @param {object} res - response to the request
 */
exports.getMyRegistrationsForCourse = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { courseId } = req.params;
  const registrations = await query(
    'SELECT * FROM getUserRegistrationForCourse($1, $2)',
    [id, courseId],
  );
  res.status(StatusCodes.OK).json({
    registrations: registrations.rows,
  });
});

/**
 * request to get hosted office hours by current user and for course
 * @param {object} req - request
 * @param {object} res - response to the request
 */
exports.getMyHostedOfficeHours = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { courseId } = req.params;
  const officeHours = await query(
    'SELECT * FROM getOfficeHoursByCourseAndHost($1, $2)',
    [id, courseId],
  );
  res.status(StatusCodes.OK).json({ officeHours: officeHours.rows });
});
