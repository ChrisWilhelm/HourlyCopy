const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');

/**
 * checks if the user is staff for the course
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isStaff = async (req, res, next) => {
  const { hosts, courseId } = req.body;

  let areStaff = true;
  try {
    /* eslint-disable no-restricted-syntax */
    for (const hostId of hosts) {
      /* eslint-disable no-await-in-loop */
      const queryIsStaff = await query('SELECT isAccountStaff($1, $2)', [
        courseId,
        hostId,
      ]);
      if (!queryIsStaff.rows[0].isaccountstaff) {
        areStaff = false;
        break;
      }
    }
  } catch {
    areStaff = false;
  }

  if (!areStaff) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'ERROR: All hosts must have valid credentials for creating an office hour',
    });
  }
  /* eslint-disable no-unused-vars */
  next();
};

/**
 * checks if the user is a student for the course
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isStudent = async (req, res, next) => {
  const { courseId } = req.body;
  const { id } = req.user;

  let isStudent = true;
  try {
    const queryIsStudent = await query('SELECT isAccountStudent($1, $2)', [
      courseId,
      id,
    ]);
    if (!queryIsStudent.rows[0].isaccountstudent) {
      isStudent = false;
    }
  } catch {
    isStudent = false;
  }

  if (!isStudent) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'ERROR: User is not enrolled as a student for specified course',
    });
  }
  /* eslint-disable no-unused-vars */
  next();
};

/**
 * checks if user is a student for the course (from the params)
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isStudentParams = async (req, res, next) => {
  const { courseId } = req.params;
  const { id } = req.user;
  let isStudent = true;
  try {
    const queryIsStudent = await query('SELECT isAccountStudent($1, $2)', [
      courseId,
      id,
    ]);
    if (!queryIsStudent.rows[0].isaccountstudent) {
      isStudent = false;
    }
  } catch {
    isStudent = false;
  }
  if (!isStudent) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'ERROR: User is not enrolled as a student for specified course',
    });
  }
  /* eslint-disable no-unused-vars */
  next();
};

/**
 * checks if user is in the course
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isInCourse = async (req, res, next) => {
  let { courseId } = req.body;
  if (courseId === undefined) {
    courseId = req.params.id;
  }
  const { id } = req.user;

  const role = await query('SELECT getRoleInCourse($1, $2)', [courseId, id]);
  if (role.rows[0].getroleincourse === 'na') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'ERROR: User does not have access to specified course',
    });
  }
  /* eslint-disable no-unused-vars */
  next();
};

/**
 * checks if user is not in the course
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isNotInCourse = async (req, res, next) => {
  const { code } = req.params;
  const { id } = req.user;

  const course = await query('SELECT * FROM course WHERE code = $1', [code]);
  const role = await query('SELECT getRoleInCourse($1, $2)', [
    course.rows[0].courseid,
    id,
  ]);
  if (role.rows[0].getroleincourse !== 'na') {
    res.status(StatusCodes.FORBIDDEN).json({
      msg: 'User is already in course',
    });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the inputed user is in the course (params for both)
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.inputIsInCourse = async (req, res, next) => {
  const { id: courseId, userId } = req.params;

  const role = await query('SELECT getRoleInCourse($1, $2)', [
    courseId,
    userId,
  ]);
  if (role.rows[0].getroleincourse === 'na') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'ERROR: Inputed user is not in specified course',
    });
  }
  next();
};

/**
 * checks user a host of the office hours
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isHost = async (req, res, next) => {
  const { officehourid: officeHourId } = req.officeHour;
  const { id } = req.user;
  let isHost = true;
  try {
    const queryIsHost = await query('SELECT isAccountHost($1, $2)', [
      officeHourId,
      id,
    ]);
    if (!queryIsHost.rows[0].isaccounthost) {
      isHost = false;
    }
  } catch {
    isHost = false;
  }

  if (!isHost) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'ERROR: User is not host for this office hour',
    });
  }
  /* eslint-disable no-unused-vars */
  next();
};

/**
 * checks if the user is coursestaff
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isCourseStaff = async (req, res, next) => {
  const { courseId } = req.params;
  const { id } = req.user;
  const isHost = await query(
    'SELECT * FROM isStaff WHERE courseId = $1 AND accountId = $2',
    [courseId, id],
  );
  if (isHost.rows === undefined || isHost.rows.length === 0) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: account is not staff for the course' });
  } else {
    /* eslint-disable no-unused-vars */
    next();
  }
  return res;
};

/**
 * checks if the user is course staff (body)
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isCourseStaffBody = async (req, res, next) => {
  const { courseId } = req.body;
  const { id } = req.user;
  const isHost = await query(
    'SELECT * FROM isStaff WHERE courseId = $1 AND accountId = $2',
    [courseId, id],
  );

  if (isHost.rows === undefined || isHost.rows.length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: account is not staff for the course' });
  }
  next();
};

/**
 * checks if the user owns the notification
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isNotifOwner = async (req, res, next) => {
  const { id: notifId } = req.params;
  const { id } = req.user;
  const isOwner = await query(
    'SELECT * FROM notifications WHERE notificationId = $1 AND accountId = $2',
    [notifId, id],
  );
  if (isOwner.rows === undefined || isOwner.rows.length === 0) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "ERROR: Can not access another user's notifications" });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the user is the instructor for the course
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isInstructor = async (req, res, next) => {
  const { courseId } = req.params;
  const { id } = req.user;

  const isHost = await query(
    'SELECT * FROM isStaff WHERE courseId = $1 AND accountId = $2',
    [courseId, id],
  );

  if (
    isHost.rows === undefined ||
    isHost.rows.length === 0 ||
    isHost.rows[0].isinstructor === false
  ) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: account is not instructor for the course' });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the user is the instructor for the course (course form body)
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isInstructorBody = async (req, res, next) => {
  const { courseId } = req.body;
  const { id } = req.user;
  const isHost = await query(
    'SELECT * FROM isStaff WHERE courseId = $1 AND accountId = $2',
    [courseId, id],
  );

  if (
    isHost.rows === undefined ||
    isHost.rows.length === 0 ||
    isHost.rows[0].isinstructor === false
  ) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'ERROR: account is not instructor for the course' });
  } else {
    next();
  }
  return res;
};

/**
 * checks if is a student that is registered for office hours
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isStudentViaOfficeHour = async (req, res, next) => {
  const { id: officeHourId } = req.params;
  const { id } = req.user;
  const courseId = await query(
    'SELECT oh.courseid FROM officehour as oh WHERE oh.officehourid = $1',
    [officeHourId],
  );
  let isStudent = true;
  try {
    const queryIsStudent = await query('SELECT isAccountStudent($1, $2)', [
      courseId.rows[0].courseid,
      id,
    ]);
    if (!queryIsStudent.rows[0].isaccountstudent) {
      isStudent = false;
    }
  } catch {
    isStudent = false;
  }

  if (!isStudent) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'ERROR: User is not enrolled as a student for specified course',
    });
  }
  /* eslint-disable no-unused-vars */
  next();
};

/**
 * checks if user is eligible to leave the course (not only instructor)
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.inputCanLeave = async (req, res, next) => {
  const { id: courseId, userId } = req.params;

  const role = await query('SELECT getRoleInCourse($1, $2)', [
    courseId,
    userId,
  ]);
  const instructors = await query(
    'SELECT * FROM isStaff WHERE courseId = $1 and isInstructor = true',
    [courseId],
  );

  if (
    role.rows[0].getroleincourse === 'instructor' &&
    instructors.rowCount <= 1
  ) {
    return res.status(StatusCodes.FORBIDDEN).json({
      msg: 'Can not remove the only instructor in a course!',
    });
  }
  req.user.role = role.rows[0].getroleincourse;
  next();
};

/**
 * checks if user can remove another user
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.canRemoveUser = async (req, res, next) => {
  const { id: courseId, userId } = req.params;
  const { id } = req.user;
  if (id === userId) {
    next();
    return;
  }

  const roleQuery = await query('SELECT getRoleInCourse($1, $2)', [
    courseId,
    id,
  ]);
  const role = roleQuery.rows[0].getroleincourse;
  // if student, only can remove themself
  if (role === 'student' || role === 'na') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'User does not have permissions to remove another user in soecified course',
    });
  }
  const inputRoleQuery = await query('SELECT getRoleInCourse($1, $2)', [
    courseId,
    userId,
  ]);
  const inputRole = inputRoleQuery.rows[0].getroleincourse;
  // if CA, can only remove students and other CAs
  // if instructor, can remove anyone
  if (
    (role === 'instructor' && inputRole === 'staff') ||
    inputRole === 'student'
  ) {
    next();
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'User does not have permissions to remove an instructor in specified course',
    });
  }
  return res;
};

/**
 * checks if the user is the one who registered
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isRegister = async (req, res, next) => {
  const { rid } = req.params;
  const { id } = req.user;

  const registerId = await query(
    'SELECT accountid FROM registration WHERE registrationid = $1',
    [rid],
  );
  if (id !== registerId.rows[0]) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'You are not the user registered under given registration',
    });
  } else {
    next();
  }
  return res;
};
