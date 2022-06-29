const { StatusCodes } = require('http-status-codes');
const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkValidation = require('../utils/checkValidation');

/**
 * request to create a topic for a course
 * @param {object} req - request to create topic
 * @param {object} res - response to the request
 */
exports.createTopic = catchAsync(async (req, res) => {
  checkValidation(req);
  const { topicName, courseId } = req.body;
  const newTopic = await db.query('SELECT * from createTopic($1, $2)', [
    topicName,
    courseId,
  ]);
  return res.status(StatusCodes.CREATED).json({
    topic: newTopic.rows,
  });
});

/**
 * request to get topics for a course
 * @param {object} req - request to get topics
 * @param {object} res - response to the request
 */
exports.getTopics = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id } = req.params;
  const topics = await db.query('SELECT * FROM topictag  WHERE courseid = $1', [
    id,
  ]);
  const numRegistrations = await db.query(
    'SELECT count(r.*) as numRegistrations, t.topicValue as topicTag, t.topicId as topicId from topicTag as t LEFT JOIN registrationForTopic as r ON r.topicId = t.topicId WHERE t.courseId = $1 GROUP BY r.topicId, t.topicId',
    [id],
  );

  return res.status(StatusCodes.CREATED).json({
    topicTags: topics.rows,
    numRegistrations: numRegistrations.rows,
  });
});

/**
 * request to get topics for a specific office  hour
 * @param {object} req - request to get topic
 * @param {object} res - response to the request
 */
exports.getTopicsForSpecificOH = catchAsync(async (req, res) => {
  checkValidation(req);
  const { id, date } = req.params;
  const topics = await db.query(
    'SELECT count(r.registrationId) as numRegistrations, t.topicId, t.topicValue FROM (topicTag as t LEFT JOIN registrationForTopic as tr ON tr.topicId = t.topicId) LEFT JOIN registration as r ON tr.registrationId = r.registrationId WHERE r.officeHourId = $1 AND r.ohdate = $2 GROUP BY r.officeHourId, t.topicId',
    [id, date],
  );
  return res.status(StatusCodes.CREATED).json({
    topicTags: topics.rows,
  });
});

/**
 * request to delete a topic for a course
 * @param {object} req - request to delete topic
 * @param {object} res - response to the request
 */
exports.deleteTopic = catchAsync(async (req, res) => {
  checkValidation(req);
  const { topicId } = req.params;
  await db.query('DELETE FROM topictag WHERE topicid = $1', [topicId]);
  return res.status(StatusCodes.CREATED).json({
    topicTags: topicId,
  });
});
