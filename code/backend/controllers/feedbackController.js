const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');
const catchAsync = require('../utils/catchAsync');

/**
 * Function to add feedback to a specific registration
 * @param {object} err - request to add feedback
 * @param {object} res - response for the request
 */
exports.addFeedback = catchAsync(async (req, res) => {
  const { feedback } = req.body;
  const { registrationId } = req.params;
  const exists = await query(
    'SELECT * FROM officehourFeedback as f WHERE f.registrationId = $1',
    [registrationId],
  );
  if (exists.rows === undefined || exists.rows.length === 0) {
    const officehourFeedback = await query(
      'SELECT addOfficeHourFeedback($1, $2)',
      [registrationId, feedback],
    );
    res.json({
      registrationId: officehourFeedback.rows[0].addofficehourfeedback,
      feedback,
    });
  } else {
    const appendFeedback = `${exists.rows[0].feedback}. ${feedback}`;
    await query(
      'UPDATE officehourFeedback SET feedback = $2 WHERE officehourFeedback.registrationId = $1',
      [registrationId, appendFeedback],
    );
    res.status(StatusCodes.ACCEPTED).json({
      registrationId,
      feedback: appendFeedback,
    });
  }
});

/**
 * Function to get feedback to a host
 * @param {object} err - request to get feedback
 * @param {object} res - response for the request
 */
exports.getFeedback = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { courseId } = req.params;
  const feedback = await query(
    'SELECT * FROM getFeedbackForHostByCourse($1, $2)',
    [id, courseId],
  );
  res.status(StatusCodes.OK).json({
    feedback: feedback.rows,
  });
});
