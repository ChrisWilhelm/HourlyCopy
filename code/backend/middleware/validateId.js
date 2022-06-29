const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');

/**
 * checks if the office hour id exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isOfficeHourId = async (req, res, next) => {
  const { id } = req.params;

  let isValidId;
  try {
    const queryValidateOfficeHourId = await query(
      'SELECT validateOfficeHourId($1)',
      [id],
    );
    isValidId = queryValidateOfficeHourId.rows[0].validateofficehourid || false;
  } catch {
    isValidId = false;
  }
  if (!isValidId) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: 'ERROR: There is no office hour with given ID',
    });
  }

  const queryOfficeHour = await query('SELECT * from getOfficeHoursById($1)', [
    id,
  ]);
  req.body.courseId = queryOfficeHour.rows[0].courseid;
  /* eslint-disable prefer-destructuring */
  req.officeHour = queryOfficeHour.rows[0];
  next();
};

/**
 * checks if the course id exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isCourseId = async (req, res, next) => {
  let { id } = req.params;
  if (id === undefined) {
    id = req.params.courseId;
  }
  let isValidId;
  try {
    const queryValidateCourseId = await query('SELECT validateCourseId($1)', [
      id,
    ]);
    isValidId = queryValidateCourseId.rows[0].validatecourseid || false;
  } catch {
    isValidId = false;
  }
  if (!isValidId) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: 'ERROR: There is no course with given ID',
    });
  }
  next();
};

/**
 * checks if the course id exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.courseIdExists = async (req, res, next) => {
  const id = req.params.courseId;
  let isValidId;
  try {
    const queryValidateCourseId = await query('SELECT validateCourseId($1)', [
      id,
    ]);
    isValidId = queryValidateCourseId.rows[0].validatecourseid || false;
  } catch {
    isValidId = false;
  }
  if (!isValidId) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: 'ERROR: There is no course with given ID',
    });
  }
  next();
};

/**
 * checks if the courseid from the body exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isCourseIdBody = async (req, res, next) => {
  const { courseId: id } = req.body;

  let isValidId;
  try {
    const queryValidateCourseId = await query('SELECT validateCourseId($1)', [
      id,
    ]);
    isValidId = queryValidateCourseId.rows[0].validatecourseid || false;
  } catch {
    isValidId = false;
  }
  if (!isValidId) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: 'ERROR: There is no course with given ID',
    });
  }
  next();
};

/**
 * checks if the notification exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isNotifId = async (req, res, next) => {
  const { id } = req.params;

  let isValidId;
  try {
    const queryValidateNotificationId = await query(
      'SELECT validateNotificationId($1)',
      [id],
    );
    isValidId =
      queryValidateNotificationId.rows[0].validatenotificationid || false;
  } catch {
    isValidId = false;
  }
  if (!isValidId) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: 'ERROR: There is no notification with given ID',
    });
  }
  next();
};

/**
 * checks if the course code is valid
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isCourseCode = async (req, res, next) => {
  const { code } = req.params;
  const course = await query('SELECT * FROM course as c WHERE c.code = $1', [
    code,
  ]);

  if (course.rows === undefined || course.rowCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: 'There is no course with given code',
    });
  } else {
    req.course = course.rows[0];
    next();
  }
  return res;
};

module.exports.isCourseIdOrCode = async (req, res, next) => {
  const { id } = req.params;
  const courseById = await query(
    'SELECT * FROM course as c WHERE c.courseid = $1',
    [id],
  );
  const courseByCode = await query(
    'SELECT * FROM course as c WHERE c.code = $1',
    [id],
  );
  if (courseById.rowCount === 0 && courseByCode.rowCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: 'There is no course with given code or id',
    });
  } else {
    req.course =
      courseById.rowCount === 0 ? courseByCode.rows[0] : courseById.rows[0];
    next();
  }
  return res;
};

/**
 * checks if the given registration id exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isRegistrationId = async (req, res, next) => {
  const { rid } = req.params;

  const registration = await query(
    'SELECT * FROM topicTag WHERE topicid = $1',
    [rid],
  );

  if (registration.rows === undefined || registration.rowCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: 'There is no registration with given id',
    });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the given topic id exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isTopicId = async (req, res, next) => {
  const { topicId } = req.params;
  const topic = await query('SELECT * FROM topicTag WHERE topicid = $1', [
    topicId,
  ]);

  if (topic.rows === undefined || topic.rowCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: 'There is no topic with given id',
    });
  } else {
    next();
  }
  return res;
};
