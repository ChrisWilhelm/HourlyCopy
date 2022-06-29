const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../../middleware/auth');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const validateRole = require('../../middleware/validateRole');
const validateUser = require('../../middleware/validateUser');
const validateId = require('../../middleware/validateId');

const router = express.Router();

// @route   POST api/users/signup
// @desc    Sign up a student
// @access  Public
router.post(
  '/signup',
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body(
    'password',
    'Please enter a password with 8 or more characters',
  ).isLength({ min: 8 }),
  body('phoneNumber').optional().isMobilePhone(),
  validateUser.emailDoesNotExist,
  authController.signup,
);

// @route    POST api/users/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/login',
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').notEmpty(),
  validateUser.emailExists,
  validateUser.hasMatchingEmailAndPassword,
  authController.login,
);

// All routes after this statement are authenticated (private)
router.use(auth);

// @route   PATCH api/users/updateMe
// @desc    Update User information
// @access  Private
router.patch(
  '/updateMe',
  body('phoneNumber', 'Please include a valid phone number')
    .optional()
    .isMobilePhone(),
  userController.updateMyUser,
);

// @route   PATCH api/users/updateMyPassword
// @desc    Update User Password
// @access  Private
router.patch(
  '/updateMyPassword',
  body('newPassword', 'Please enter a password with 8 or more characters')
    .optional()
    .isLength({ min: 8 }),
  validateUser.exists,
  validateUser.hasMatchingPassword,
  authController.updatePassword,
);

// @route   GET api/users/me
// @desc    Get current user information
// @access  Private
router.get('/me', validateUser.exists, userController.getMyUser);

// @route   DELETE api/users/me
// @desc    Delete the current user's account
// @access  Private
router.delete('/me', validateUser.exists, authController.delete);

// @route   GET api/users/me/courses
// @desc    Get all courses I'm rostered in
// @access  Private
router.get('/me/courses', userController.getMyCourses);

// @route   GET api/users/me/registrations/
// @desc    Get all registrations I have
// @access  Private
router.get('/me/registrations', userController.getMyRegistrations);

// @route   GET api/users/me/registrations/:courseId
// @desc    Get all registrations I have for a course
// @access  Private
router.get(
  '/me/registrations/:courseId',
  param('courseId', 'Please include a courseId').notEmpty(),
  validateId.isCourseId,
  userController.getMyRegistrationsForCourse,
);

// @route   GET api/users/me/hosting/:courseId
// @desc    Get sessions I am hosting for a course
// @access  Private
router.get(
  '/me/hosting/:courseId',
  param('courseId', 'Please enter a courseId').notEmpty(),
  validateId.isCourseId,
  validateRole.isCourseStaff,
  userController.getMyHostedOfficeHours,
);

module.exports = router;
