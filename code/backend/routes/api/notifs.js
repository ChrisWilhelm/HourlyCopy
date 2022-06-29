const express = require('express');
const { param } = require('express-validator');
const notifController = require('../../controllers/notifController');
const validateRole = require('../../middleware/validateRole');
const validateId = require('../../middleware/validateId');

const router = express.Router();

// @route   GET api/users/me/notifs/
// @desc    Get all my notifications
// @access  Private
router.get('/', notifController.getNotifs);

// @route   POST api/users/me/notifs/
// @desc    Add a notification for me
// @access  Private
router.post('/', notifController.addNotif);

// @route   DELETE api/users/me/notifs/:id
// @desc    Remove one of my notifications
// @access  Private
router.delete(
  '/:id',
  param(
    'id',
    'Please enter an integer id for the notification you want to delete',
  ).isInt(),
  validateId.isNotifId,
  validateRole.isNotifOwner,
  notifController.deleteNotif,
);

// @route   DELETE api/users/me/notifs/clear
// @desc    Clear all of my notifications
// @access  Private
router.delete('/clear', notifController.clearNotifs);

module.exports = router;
