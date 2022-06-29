const express = require('express');
const { param, body } = require('express-validator');
const auth = require('../../middleware/auth');
const officeHourController = require('../../controllers/officeHourController');
const registrationController = require('../../controllers/registrationController');
const notifController = require('../../controllers/notifController');
const queueController = require('../../controllers/queueController');
const topicController = require('../../controllers/topicController');
const validateRole = require('../../middleware/validateRole');
const validateTime = require('../../middleware/validateTime');
const validateRegistration = require('../../middleware/validateRegistration');
const validateDate = require('../../middleware/validateDate');
const validateId = require('../../middleware/validateId');
const validateOfficeHour = require('../../middleware/validateOfficeHour');
const validateQueue = require('../../middleware/validateQueue');

const router = express.Router();

router.use(auth);

// @route   POST api/courses/officeHours/create
// @desc    Create an office hours
// @access  Private
router.post(
  '/create',
  body('startTime', 'Please specify what time this event starts').notEmpty(),
  body('endTime', 'Please specify what time this event ends').notEmpty(),
  body(
    'recurringEvent',
    'Please specify if this is a recurring event',
  ).isBoolean(),
  body('startDate', 'Please specify what date this event starts').notEmpty(),
  body('endDate', 'Please specify what date this event ends').notEmpty(),
  body(
    'location',
    'Please specify a location for your office hours',
  ).notEmpty(),
  body(
    'courseId',
    'Please specify the ID of the course this office hours is for',
  ).isInt(),
  body(
    'daysOfWeek',
    'Please include which days of the week for the office hours',
  )
    .isArray()
    .notEmpty(),
  body(
    'timeInterval',
    'Please include a positive integer for time interval',
  ).isInt({ min: 1 }),
  body('hosts', 'Please include the staff ID(s) hosting the office hours')
    .isArray()
    .notEmpty(),
  validateDate.isEndAfter,
  validateTime.isTime,
  validateId.isCourseIdBody,
  validateRole.isInCourse,
  validateRole.isStaff,
  validateDate.isValidNonrecurring,
  validateOfficeHour.isNotConflictingOfficeHour,
  officeHourController.create,
);

// @route   DELETE api/courses/officeHours/:id/all
// @desc    Cancel all sessions of an office hours
// @access  Private
router.delete(
  '/:id/all',
  param('id', 'Office Hour ID is required').isInt(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  validateOfficeHour.isNotCancelled,
  notifController.deletedOH,
  officeHourController.delete,
);

// @route   DELETE api/courses/officeHours/:id/:date/this
// @desc    Cancel a session of an office hours at given date
// @access  Private
router.delete(
  '/:id/:date/this',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  validateOfficeHour.isNotCancelled,
  validateDate.isOhOnDateCancel,
  validateDate.isCancelOneHourOut,
  notifController.cancellation,
  officeHourController.cancel,
);

// @route   DELETE api/courses/officeHours/:id/:date/following
// @desc    Cancel all sessions of an office hours on and after given date
// @access  Private
router.delete(
  '/:id/:date/following',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify the date to start cancelling from').notEmpty(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  validateDate.isDateAfterStart,
  validateOfficeHour.isNotCancelled,
  validateDate.isCancelOneHourOut,
  notifController.cancellationFollowing,
  officeHourController.cancelFollowing,
);

// @route   POST api/courses/officeHours/:id/register
// @desc    Add registration for an office hours
// @access  Private
router.post(
  '/:id/register',
  param('id', 'Office hour ID is required').isInt(),
  body('startTime', 'Please specify what time this event starts').notEmpty(),
  body('endTime', 'Please specify what time this event ends').notEmpty(),
  body('date', 'Please specify what date this event happens').notEmpty(),
  body(
    'questions',
    'Please include questions for the office hours as a list',
  ).isArray(),
  body('topicTagIds', 'Please include topic ids for the office hours as a list')
    .optional()
    .isArray(),
  validateId.isOfficeHourId,
  validateRegistration.isNotRegistered,
  validateTime.isTime,
  validateDate.isOhOnDate,
  validateTime.isDateInTimeRange,
  validateRole.isStudent,
  validateOfficeHour.isNotCancelled,
  // validateRegistration.isAvailable,
  officeHourController.register,
);

// @route   POST api/courses/officeHours/registrations/:rid/cancel
// @desc    Cancel a registration for an office hour
// @access  Private
router.post(
  '/registrations/:rid/cancel',
  param('rid', 'Registration ID is required').isInt(),
  validateId.isRegistrationId,
  validateRole.isRegister,
  registrationController.cancel,
);

// @route   GET api/courses/officeHours/:id/times/:date
// @desc    Get all available time intervals for a specific office hours on date
// @access  Private
router.get(
  '/:id/times/:date',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'please use a valid date').notEmpty(),
  validateId.isOfficeHourId,
  validateDate.isOhOnDateCancel,
  validateRole.isInCourse,
  officeHourController.getTimes,
);

// @route   GET api/courses/officeHours/:id/registrations
// @desc    Get all registrations for a given office hour
// @access  Private
router.get(
  '/:id/registrations',
  param('id', 'Office Hour ID is required').isInt(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  officeHourController.getRegistrations,
);

// @route   GET api/courses/officeHours/:id/:date/questions
// @desc    Get all questions for a given office hour
// @access  Private
router.get(
  '/:id/:date/questions',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  validateDate.isOhOnDateCancel,
  officeHourController.getQuestions,
);

// @route   GET api/courses/officeHours/:id/:date/queue
// @desc    get queue for an office hour on a date
// @access  Private
router.get(
  '/:id/:date/queue',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  validateDate.isOhOnDateCancel,
  queueController.getQueue,
);

// @route   GET api/courses/officeHours/:id/:date/queue/student
// @desc    get student view for queue for an office hour on a date
// @access  Private
router.get(
  '/:id/:date/queue/student',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  validateId.isOfficeHourId,
  validateRole.isStudentViaOfficeHour,
  validateDate.isOhOnDateCancel,
  queueController.getStudentQueue,
);

// @route   GET api/courses/officeHours/:id/:date/queueStarted
// @desc    checks if the queue has started yet
// @access  Private
router.get(
  '/:id/:date/queueStarted',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  validateId.isOfficeHourId,
  validateRole.isStudentViaOfficeHour,
  validateDate.isOhOnDateCancel,
  queueController.getQueueStatus,
);

// @route   POST api/courses/officeHours/:id/queue/waitlist
// @desc    add current user to the waitlist for a specific session
// @access  Private
router.post(
  '/:id/queue/waitlist',
  param('id', 'Office Hour ID is required').isInt(),
  validateId.isOfficeHourId,
  validateDate.isOhOnDateCancel,
  validateQueue.isUserNotInQueue,
  validateQueue.isStudentOnWaitlist,
  queueController.addToWaitlist,
);

// @route   POST api/courses/officeHours/queue/:accountId/noShow
// @desc    adds a student to the no show list for a specific session
// @access  Private
router.post(
  '/:id/queue/:accountId/noShow',
  param('id', 'Office Hour ID is required').isInt(),
  param('accountId', 'Account ID is required').isInt(),
  validateId.isOfficeHourId,
  validateDate.isOhOnDateCancel,
  validateRole.isHost,
  validateQueue.isStudentInQueue,
  queueController.addToNoShow,
);

// @route   DELETE api/courses/officeHours/:id/:date/queue/:accountId
// @desc    removes a student from the queue for a specific session
// @access  Private
router.delete(
  '/:id/:date/queue/:accountId',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  param('accountId', 'Account ID is required').isInt(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  validateDate.isOhOnDateCancel,
  validateQueue.isStudentInQueue,
  queueController.removeFromQueue,
);

// @route   DELETE api/courses/officeHours/:id/:date/waitlist/:accountId
// @desc    removes a student from the waitlist for a specific session
// @access  Private
router.delete(
  '/:id/:date/waitlist/:accountId',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  param('accountId', 'Account ID is required').isInt(),
  validateId.isOfficeHourId,
  validateDate.isOhOnDateCancel,
  validateQueue.isOnWaitlist,
  queueController.removeSelfFromWaitlist,
);

// @route   PATCH api/courses/officeHours/:id/queue/waitlist/toBack
// @desc    moves top of waitlist to the end
// @access  Private
router.patch(
  '/:id/queue/waitlist/toBack',
  param('id', 'Office Hour ID is required').isInt(),
  validateId.isOfficeHourId,
  validateRole.isHost,
  validateDate.isOhOnDateCancel,
  validateQueue.isStudentOnWaitlist,
  queueController.moveTopToBack,
);

// @route   GET api/courses/officeHours/:id/topicTags/:date
// @desc    Get topics for a course office hours and number of selections of each topic for session
// @access  Private
router.get(
  '/:id/topicTags/:date',
  param('id', 'Office Hour ID is required').isInt(),
  param('date', 'Please specify what date this event happens').notEmpty(),
  validateId.isOfficeHourId,
  validateDate.isOhOnDateCancel,
  validateRole.isHost,
  topicController.getTopicsForSpecificOH,
);

module.exports = router;
