const express = require('express');
const { param, body } = require('express-validator');
const auth = require('../../middleware/auth');
const controller = require('../../controllers/courseController');
const officeHourController = require('../../controllers/officeHourController');
const feedbackController = require('../../controllers/feedbackController');
const registrationController = require('../../controllers/registrationController');
const notifController = require('../../controllers/notifController');
const queueController = require('../../controllers/queueController');
const topicController = require('../../controllers/topicController');
const validateRole = require('../../middleware/validateRole');
const validateRegistration = require('../../middleware/validateRegistration');
const validateDate = require('../../middleware/validateDate');
const validateId = require('../../middleware/validateId');
const validateUser = require('../../middleware/validateUser');
const validateCourse = require('../../middleware/validateCourse');
const validateTopic = require('../../middleware/validateTopic');

const router = express.Router();

router.use(auth);

// @route   POST api/courses/
// @desc    Create a course
// @access  Private
router.post(
  '/',
  body('title', 'Course title is required').notEmpty(),
  body('number', 'Course number is required').notEmpty(),
  body('semester', 'Semester is required').isIn([
    'Spring',
    'Summer',
    'Fall',
    'Winter',
  ]),
  body('year', 'A valid year is required').isInt({
    min: new Date().getFullYear(),
  }),
  validateCourse.isNotDuplicate,
  controller.create,
);

// @route   GET api/courses/:id
// @desc    Get course details by code or id
// @access  Private
router.get(
  '/:id',
  param('id', 'Course Code or ID is required').notEmpty(),
  validateId.isCourseIdOrCode,
  validateRole.isInCourse,
  controller.get,
);

// @route   DELETE api/courses/:courseId
// @desc    Delete a course
// @access  Private
router.delete(
  '/:courseId',
  param('courseId', 'Course ID is required').isInt(),
  validateId.isCourseId,
  validateRole.isInstructor,
  notifController.courseDeleted,
  controller.delete,
);

// @route   POST api/courses/:code
// @desc    Register for a course
// @access  Private
router.post(
  '/:code',
  param('code', 'Code is required').notEmpty(),
  validateId.isCourseCode,
  validateRole.isNotInCourse,
  controller.registerWithCode,
);

// @route   POST api/courses/:courseId/roster
// @desc    Add a user to course
// @access  Private
router.post(
  '/:courseId/roster',
  param('courseId', 'Course ID is required').isInt(),
  body('email', 'Email is required').isEmail(),
  body('role', 'Role is required').isIn(['student', 'staff', 'instructor']),
  validateId.isCourseId,
  validateRole.isCourseStaff,
  validateUser.emailExists,
  validateUser.emailIsNotInCourse,
  controller.addUser,
);

// @route   DELETE api/courses/:id/roster/:userId
// @desc    Remove a user from a course ( user can not be the only rostered staff )
// @access  Private
router.delete(
  '/:id/roster/:userId',
  param('id', 'Valid course ID is required').isInt(),
  param('userId', 'Valid user ID is required').isInt(),
  validateId.isCourseId,
  validateUser.inputExists,
  validateRole.isInCourse,
  validateRole.inputIsInCourse,
  validateRole.canRemoveUser,
  validateRole.inputCanLeave,
  controller.removeUser,
);

// @route   GET api/courses/:id/role
// @desc    Check what role the user has in the course
// @access  Private
router.get(
  '/:id/role',
  param('id', 'Valid course ID is required').isInt(),
  validateId.isCourseId,
  validateRole.isInCourse,
  controller.getRole,
);

// @route   GET api/courses/:courseId/getRoster
// @desc    get roster for a course
// @access  Private
router.get(
  '/:courseId/getRoster',
  param('courseId', 'Valid course ID is required').isInt(),
  validateId.isCourseId,
  validateRole.isCourseStaff,
  controller.getRoster,
);

// @route   GET api/courses/:id/officeHours
// @desc    Get all office hours for a course
// @access  Private
router.get(
  '/:id/officeHours',
  param('id', 'Course ID is required').isInt(),
  validateId.isCourseId,
  validateRole.isInCourse,
  officeHourController.get,
);

// @route   POST api/courses/registrations/:registrationId/feedback
// @desc    Post feedback for an officeHours
// @access  Private
router.post(
  '/registrations/:registrationId/feedback',
  param('registrationId', 'Please include a registration id').isInt(),
  validateRegistration.accountMatchRegistration,
  body('feedback', 'Please include feedback string').notEmpty(),
  feedbackController.addFeedback,
);

// @route   GET api/courses/:courseId/officeHours/feedback
// @desc    get feedback for a course for a specific host
// @access  Private
router.get(
  '/:courseId/officeHours/feedback',
  param('courseId', 'Course Id is requires').notEmpty(),
  validateRole.isCourseStaff,
  feedbackController.getFeedback,
);

// @route   POST api/courses/topicTag/create
// @desc    Create a topic for a course
// @access  Private
router.post(
  '/topicTag/create',
  body('topicName', 'Please include topic name').notEmpty(),
  body('courseId', 'Please include course id').isInt(),
  validateId.isCourseIdBody,
  validateRole.isCourseStaffBody,
  validateRole.isInstructorBody,
  validateTopic.isUniqueTopic,
  topicController.createTopic,
);

// @route   GET api/courses/:courseId/topicTags
// @desc    Get topics for a course
// @access  Private
router.get(
  '/:id/topicTags',
  param('id', 'Course Id is required').notEmpty(),
  validateId.isCourseId,
  validateRole.isInCourse,
  topicController.getTopics,
);

// @route   DELETE api/courses/:courseId/topictags/:topicid
// @desc    removes a topic from course
// @access  Private
router.delete(
  '/:courseId/topicTags/:topicId',
  param('courseId', 'Course Id is required').notEmpty(),
  param('topicId', 'topic Id is required').isInt(),
  validateId.isCourseId,
  validateRole.isInstructor,
  validateId.isTopicId,
  topicController.deleteTopic,
);

// @route   GET api/courses/:courseId/officeHours/:id/:date/isRegistered
// @desc    determines if a student is registered for that specific officehours on the date
// @access  Private
router.get(
  '/:courseId/officeHours/:id/:date/isRegistered',
  validateId.courseIdExists,
  validateRole.isStudentParams,
  validateId.isOfficeHourId,
  validateDate.isOhOnDateCancel,
  registrationController.isRegistered,
);

// @route   GET api/courses/:courseId/officeHours/:id/:date/isOnWaitlist
// @desc    determines if a student is on the waitlist for that specific officehours on the date
// @access  Private
router.get(
  '/:courseId/officeHours/:id/:date/isOnWaitlist',
  validateId.courseIdExists,
  validateRole.isStudentParams,
  validateId.isOfficeHourId,
  validateDate.isOhOnDateCancel,
  queueController.isOnWaitlist,
);

// @route   GET api/courses/:courseId/registrations/count
// @desc    get the number of registrations per student for a course
// @access  Private
router.get(
  '/:courseId/registrations/count',
  validateId.isCourseId,
  validateRole.isCourseStaff,
  controller.numRegistrationPerStudent,
);

// @route   GET api/courses/:courseId/registrations/count/byTime
// @desc    get the number of registrations per time interval (1 hour) for a course
// @access  Private
router.get(
  '/:courseId/registrations/count/byTime',
  validateId.isCourseId,
  validateRole.isCourseStaff,
  controller.numRegistrationPerTime,
);

// @route   GET api/courses/:courseId/registrations/count/byOfficeHour/perDayOfWeek
// @desc    get the number of registrations per office hour per day of week
// @access  Private
router.get(
  '/:courseId/registrations/count/byOfficeHour/perDayOfWeek',
  validateId.isCourseId,
  validateRole.isCourseStaff,
  controller.numRegistrationPerDOW,
);

// @route   GET api/courses/:courseId/registrations/count/staff
// @desc    get the number of registrations per staff for a course
// @access  Private
router.get(
  '/:courseId/registrations/count/staff',
  validateId.isCourseId,
  validateRole.isCourseStaff,
  controller.numRegistrationPerStaff,
);

module.exports = router;
