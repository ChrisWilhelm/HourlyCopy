const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');

/**
 * checks if the course requested is a duplicate
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isNotDuplicate = async (req, res, next) => {
  const { title, number, semester, year } = req.body;

  const duplicateCourse = await query(
    'SELECT * FROM course WHERE title = $1 AND courseNumber = $2 AND semester = $3 AND calenderyear = $4',
    [title, number, semester, year],
  );
  if (duplicateCourse.rowCount !== 0) {
    res.status(StatusCodes.CONFLICT).json({ msg: 'Course already exists' });
  } else {
    next();
  }
  return res;
};
