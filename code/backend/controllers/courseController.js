const { customAlphabet } = require('nanoid/async');
const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const checkValidation = require('../utils/checkValidation');
const notifController = require('./notifController');
const { query } = require('../config/db');

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6);

/**
 * Creates a course
 * @param {object} req - request for the course
 * @param {object} res - response for the request
 */
exports.create = catchAsync(async (req, res) => {
  checkValidation(req);

  const { title, number, semester, year } = req.body;
  const { id } = req.user;
  const code = await nanoid();
  const newcourse = await query('SELECT createCourse($1, $2, $3, $4, $5)', [
    title,
    number,
    semester,
    year,
    code,
  ]);
  const courseId = newcourse.rows[0].createcourse;
  const course = await query(
    'SELECT * FROM course as c WHERE c.courseid = $1',
    [courseId],
  );
  await query('SELECT addStaff($1, $2, $3)', [courseId, id, true]);
  return res.status(StatusCodes.CREATED).json({
    course: course.rows[0],
  });
});

/**
 * Deletes a course
 * @param {object} req - request for the course
 * @param {object} res - response for the request
 */
exports.delete = catchAsync(async (req, res) => {
  checkValidation(req);
  const { courseId } = req.params;
  await query('DELETE FROM course WHERE courseId = $1', [courseId]);
  return res.status(StatusCodes.OK).json({
    msg: 'Course successfully deleted',
  });
});

/**
 * Gets a course's information
 * @param {object} req - request for the course
 * @param {object} res - response for the request
 */
exports.get = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id } = req.params;
  const { id: accountId } = req.user;

  let course;
  let isValidCourseId;
  try {
    const validateCourseId = await query('SELECT validateCourseId($1)', [id]);
    isValidCourseId = validateCourseId.rows[0].validatecourseid;
  } catch {
    isValidCourseId = false;
  }
  if (isValidCourseId) {
    const role = await query('SELECT getRoleInCourse($1, $2)', [id, accountId]);
    // Received an id
    if (role.rows[0].getroleincourse === 'student') {
      course = await query(
        'SELECT c.courseid, c.title, c.coursenumber, c.semester, c.calenderyear FROM course as c where c.courseId = $1',
        [id],
      );
    } else {
      course = await query('SELECT * FROM course as c where c.courseId = $1', [
        id,
      ]);
    }
  } else {
    // Received a course code
    course = await query(
      'SELECT * FROM course as c WHERE c.courseId = (SELECT getCourseByCode($1))',
      [id],
    );
  }
  res.status(StatusCodes.OK).json(course.rows[0]);
});

/**
 * Adds a user to the course
 * @param {object} req - request for the course
 * @param {object} res - response for the request
 */
exports.addUser = catchAsync(async (req, res) => {
  checkValidation(req);
  const { email, role } = req.body;
  const { courseId } = req.params;
  const user = await query(
    'SELECT * FROM account WHERE lower(email) = lower($1)',
    [email],
  );
  const { accountid: userId, uname: name } = user.rows[0];
  if (role === 'student') {
    await query('SELECT addStudent($1, $2)', [courseId, userId]);
  } else if (role === 'staff') {
    notifController.addStaff(courseId, name, false);
    await query('SELECT addStaff($1, $2, $3)', [courseId, userId, false]);
  } else if (role === 'instructor') {
    notifController.addStaff(courseId, name, true);
    await query('SELECT addStaff($1, $2, $3)', [courseId, userId, true]);
  }
  res.status(StatusCodes.ACCEPTED).json({ accountId: userId, courseId });
  notifController.addUser(courseId, userId, role);
  return res;
});

/**
 * Removes an account from the course
 * @param {object} req - request for the course to remove a user
 * @param {object} res - response for the request
 */
exports.removeUser = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id, userId } = req.params;
  const { id: staffId, role } = req.user;
  const course = await query(
    'SELECT * FROM course as c WHERE c.courseId = $1',
    [id],
  );
  if (staffId === userId) {
    const removeSelf = await query(
      'SELECT * FROM removeSelfFromCourse($1, $2)',
      [id, staffId],
    );
    if (removeSelf.rows[0].removed) {
      notifController.removeUser(userId, course.rows[0]);
      res.status(StatusCodes.ACCEPTED).json({ msg: removeSelf.rows[0].msg });
    } else {
      res.status(StatusCodes.CONFLICT).json({ msg: removeSelf.rows[0].msg });
    }
  } else {
    const removeOther = await query(
      'SELECT * FROM removeFromCourse($1, $2, $3)',
      [id, staffId, userId],
    );
    if (removeOther.rows[0].removed) {
      notifController.removeUser(userId, course.rows[0]);
      res.status(StatusCodes.ACCEPTED).json({ msg: removeOther.rows[0].msg });
    } else {
      res.status(StatusCodes.CONFLICT).json({ msg: removeOther.rows[0].msg });
    }
    if (role === 'instructor' || role === 'staff') {
      notifController.removeStaff(course, userId, role === 'instructor');
    }
  }
});

/**
 * Registers a student with the course code
 * @param {object} req - request for the course to register
 * @param {object} res - response for the request
 */
exports.registerWithCode = catchAsync(async (req, res) => {
  checkValidation(req);
  const { code } = req.params;
  const { id } = req.user;
  const course = await query('SELECT * FROM course as c WHERE c.code = $1', [
    code,
  ]);
  await query('SELECT addStudent($1, $2)', [course.rows[0].courseid, id]);
  notifController.registration(id, course.rows[0]);
  res
    .status(StatusCodes.ACCEPTED)
    .json({ msg: `Registered for ${course.rows[0].title}` });
});

/**
 * Gets the roster for the course
 * @param {object} req - request for the roster
 * @param {object} res - response for the request
 */
exports.getRoster = catchAsync(async (req, res) => {
  checkValidation(req);
  const { courseId } = req.params;

  const students = await query('SELECT * FROM getStudentsForCourse($1)', [
    courseId,
  ]);
  const staff = await query('SELECT * FROM getStaffForCourse($1)', [courseId]);
  const instructor = await query('SELECT * FROM getInstructorsForCourse($1)', [
    courseId,
  ]);
  res.status(StatusCodes.ACCEPTED).json({
    students: students.rows,
    staff: staff.rows,
    instructors: instructor.rows,
  });
});

/**
 * Gets a users role in the course
 * @param {object} req - request for the users role
 * @param {object} res - response for the request
 */
exports.getRole = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id } = req.user;
  const { id: courseId } = req.params;

  const role = await query('SELECT getRoleInCourse($1, $2)', [courseId, id]);

  res.status(StatusCodes.OK).json({
    role: role.rows[0].getroleincourse,
  });
});

/**
 * Gets the number of registrations per student
 * @param {object} req - request for the registration data per student
 * @param {object} res - response for the request
 */
exports.numRegistrationPerStudent = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const counts = await query(
    'SELECT * FROM getRegistrationCountPerStudent($1)',
    [courseId],
  );
  res.status(StatusCodes.OK).json({ counts: counts.rows });
});

/**
 * Gets the number of registrations per time interval
 * @param {object} req - request for the registration data per time interval
 * @param {object} res - response for the request
 */
exports.numRegistrationPerTime = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const counts = await query('SELECT * FROM getRegistrationCountPerTime($1)', [
    courseId,
  ]);
  res.status(StatusCodes.OK).json({ counts: counts.rows });
});

/**
 * Gets the number of registrations per day of week
 * @param {object} req - request for the registration data per day of week
 * @param {object} res - response for the request
 */
exports.numRegistrationPerDOW = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const counts = await query('SELECT * FROM getRegistrationCountPerDOW($1)', [
    courseId,
  ]);
  res.status(StatusCodes.OK).json({ counts: counts.rows });
});

/**
 * Gets the number of registrations per staff
 * @param {object} req - request for the registration data per staff
 * @param {object} res - response for the request
 */
exports.numRegistrationPerStaff = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const counts = await query('SELECT * FROM getRegistrationCountPerStaff($1)', [
    courseId,
  ]);
  res.status(StatusCodes.OK).json({ counts: counts.rows });
});
