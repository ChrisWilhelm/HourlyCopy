const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');

/**
 * checks if the topic is unique for the course
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isUniqueTopic = async (req, res, next) => {
  const { courseId, topicName } = req.body;

  const account = await query(
    'SELECT * from topicTag WHERE topicValue = $1 AND courseId = $2',
    [topicName, courseId],
  );
  if (account.rowCount !== 0) {
    res.status(StatusCodes.CONFLICT).json({
      msg: 'ERROR: This topic already exists for this course',
    });
  } else {
    next();
  }
  return res;
};
