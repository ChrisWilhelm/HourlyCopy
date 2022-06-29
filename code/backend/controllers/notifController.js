const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { mailTransporter } = require('../config/email');

/**
 * Function to send an email notification
 * @param {integer} recipientId - id of the recipient
 * @param {object} subject - subject of the email
 * @param {object} body - body of the email
 */
const sendEmail = async (recipientId, subject, body = '') => {
  const account = await query('SELECT * FROM account WHERE accountid = $1', [
    recipientId,
  ]);
  const mailDetails = {
    from: `"JHU Hourly ⌛" <${process.env.GMAIL_USER}>`,
    to: account.rows[0].email,
    subject,
    text: `${body} \nJHU Hourly ("https://team-04-vasscc-hourly.herokuapp.com/")`,
    html: `<p>${body}</p></br><hr/></br><center><a href="https://team-04-vasscc-hourly.herokuapp.com/">JHU Hourly</a></center>`,
  };
  try {
    mailTransporter.sendMail(mailDetails);
  } catch {
    console.log('Failed to send email notification');
  }
};

/**
 * Function to get the notifications for the user
 * @param {object} req - request to get the notifications
 * @param {object} res - response for the request
 */
exports.getNotifs = catchAsync(async (req, res) => {
  const { id } = req.user;
  const notifs = await query('SELECT * from getNotificationsByUser($1)', [id]);
  res.status(StatusCodes.OK).json({
    notifications: notifs.rows,
  });
});

/**
 * Function to add a notification for a user
 * @param {integer} id - user id to add notification for
 * @param {string} text - notification text
 */
const notify = async (id, text) => {
  const notif = await query('SELECT * from addNotification($1, $2)', [
    id,
    text,
  ]);
  return notif.rows[0];
};

/**
 * request to add a notification for a user
 * @param {object} req - request for the notification
 * @param {object} res - response for the request
 */
exports.addNotif = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { text } = req.body;
  const notif = await notify(id, text);
  res.status(StatusCodes.OK).json({
    notification: notif,
  });
});

/**
 * request to delete a notification for a user
 * @param {object} req - request for the notification
 * @param {object} res - response for the request
 */
exports.deleteNotif = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notif = await query('SELECT removeSpecificNotification($1)', [id]);
  res.status(StatusCodes.OK).json({
    deleted: notif.rows[0].removespecificnotification,
  });
});

/**
 * request to delete all notifications for a user
 * @param {object} req - request for the notification
 * @param {object} res - response for the request
 */
exports.clearNotifs = catchAsync(async (req, res) => {
  const { id } = req.user;
  const notif = await query('SELECT clearNotifications($1)', [id]);
  res.status(StatusCodes.OK).json({
    deleted: notif.rows[0].clearnotifications,
  });
});

// const dateOptions = {
//   weekday: 'short',
//   year: 'numeric',
//   month: 'long',
//   day: 'numeric',
// };

/**
 * function to generat a office hour cancel message
 * @param {object} officeHour - office hour object
 * @param {object} date - date for the office hour
 */
const getCancelMessage = (officeHour, date = '') => {
  let title = '';
  officeHour.hostsinfo.forEach((host) => {
    title += `${host.name} + `;
  });
  // trim last ' + '
  let dateStr = '';
  if (date !== '') {
    dateStr = new Date(date).toDateString(); // .toLocaleDateString('en-US', dateOptions);
  }
  title = title.substring(0, title.length - 3);
  const start = new Date();
  const startTime = officeHour.starttime.split(':');
  const end = new Date();
  const endTime = officeHour.endtime.split(':');
  start.setHours(startTime[0], startTime[1], startTime[2]);
  end.setHours(endTime[0], endTime[1], endTime[2]);

  title += `'s Office Hours from ${start.toLocaleTimeString('en-US', {
    timeStyle: 'short',
  })} to ${end.toLocaleTimeString('en-US', {
    timeStyle: 'short',
  })} has been CANCELLED`;
  if (date !== '') {
    title += ` for ${dateStr}`;
  }
  return title;
};

/**
 * request to add a notification for a deleted office hour
 * @param {object} req - request for deleted office hour
 * @param {object} res - response for the request
 * @param {object} next - call back function for the next step
 */
exports.deletedOH = catchAsync(async (req, res, next) => {
  const { officeHour } = req;
  const msg = getCancelMessage(officeHour);

  // notify students who registered
  const registrationsQuery = await query(
    'SELECT * from getRegistrationsForOfficeHours($1)',
    [officeHour.officehourid],
  );
  await registrationsQuery.rows.forEach(async (registration) => {
    notify(registration.accountid, `ALL ${msg}`);
    sendEmail(registration.accountid, 'Office Hour Cancelled!', msg);
  });

  // notify hosts of the cancellation
  await officeHour.hostsinfo.forEach(async (host) => {
    notify(host.accountid, `ALL ${msg}`);
    sendEmail(
      host.accountid,
      'Your office hour has been succesfully deleted',
      msg,
    );
  });
  next();
});

/**
 * request to add a notification for a cancelled office hour
 * @param {object} req - request for deleted office hour
 * @param {object} res - response for the request
 * @param {object} next - call back function for the next step
 */
exports.cancellation = catchAsync(async (req, res, next) => {
  const { officeHour } = req;
  const { date } = req.params;
  const msg = getCancelMessage(officeHour, date);

  // notify students who registered
  const registrationsQuery = await query(
    'SELECT * from getRegistrationsForOfficeHours($1)',
    [officeHour.officehourid],
  );
  const dateObj = new Date(date);
  const dateString = dateObj.toISOString().substring(0, 11);
  await registrationsQuery.rows.forEach(async (registration) => {
    const regDate = registration.ohdate.toISOString().substring(0, 11);
    if (dateString === regDate) {
      notify(registration.accountid, msg);
      sendEmail(registration.accountid, 'Office Hour Cancelled!', msg);
    }
  });

  // notify hosts of the cancellation
  await officeHour.hostsinfo.forEach(async (host) => {
    notify(host.accountid, msg);
    sendEmail(
      host.accountid,
      'Office Hour Session Successfully Cancelled',
      msg,
    );
  });
  next();
});

/**
 * request to add a notification for a cancelled office hour
 * @param {object} req - request for deleted office hour
 * @param {object} res - response for the request
 * @param {object} next - call back function for the next step
 */
exports.cancellationFollowing = catchAsync(async (req, res, next) => {
  const { officeHour } = req;
  const { date } = req.params;
  const dateObj = new Date(date);
  const msg = getCancelMessage(officeHour);

  // notify students who registered
  const registrationsQuery = await query(
    'SELECT * from getRegistrationsForOfficeHours($1)',
    [officeHour.officehourid],
  );
  await registrationsQuery.rows.forEach(async (registration) => {
    const regDate = registration.ohdate;
    if (regDate > dateObj) {
      const cancelledDate = regDate.toISOString().substring(0, 11);
      notify(registration.accountid, `${msg} for ${cancelledDate}`);
      sendEmail(registration.accountid, 'Office Hour Cancelled!', msg);
    }
  });

  // notify hosts of the cancellation
  await officeHour.hostsinfo.forEach(async (host) => {
    notify(host.accountid, `${msg} starting from ${date}`);
    sendEmail(
      host.accountid,
      'All Following Office Hour sessions Successfully Cancelled',
      msg,
    );
  });
  next();
});

/**
 * request to add a notification for a registered office hour
 * @param {integer} id - user id
 * @param {object} course - course object
 */
exports.registration = catchAsync(async (id, course) => {
  const { title, semester, calenderyear } = course;
  notify(
    id,
    `You have successfully joined ${title} for ${semester} ${calenderyear}!`,
  );
});

/**
 * request to add a notification for adding a user to a course
 * @param {integer} courseId
 * @param {integer} userId
 * @param {string} role - role of the user in the course
 */
exports.addUser = catchAsync(async (courseId, userId, role) => {
  const { rows: course } = await query(
    'SELECT * FROM course WHERE courseid = $1',
    [courseId],
  );
  const { title, semester, calenderyear } = course[0];
  const msg = `You have been added as a ${role} to ${title} for ${semester} ${calenderyear}!`;
  notify(userId, msg);
  sendEmail(userId, 'You have been Added to a New Course', msg);
});

/**
 * request to add a notification for adding a user to a course
 * @param {integer} courseId
 * @param {string} name
 * @param {boolean} isInstructor - if the user will be an instructor
 */
exports.addStaff = catchAsync(async (courseId, name, isInstructor) => {
  const { rows: course } = await query(
    'SELECT * FROM course WHERE courseId = $1',
    [courseId],
  );
  const { title, semester, calenderyear } = course[0];
  const role = isInstructor ? 'an instructor' : 'a staff member';
  const msg = `${name} has been added as ${role} to ${title}, ${semester} ${calenderyear}`;

  // Notify staff
  const staff = await query('SELECT * FROM isStaff WHERE courseId = $1', [
    courseId,
  ]);
  await staff.rows.forEach(async (s) => {
    await notify(s.accountid, msg);
  });
});

/**
 * request to add a notification for removing a user to a course
 * @param {integer} id
 * @param {object} course
 */
exports.removeUser = catchAsync(async (id, course) => {
  const { title, semester, calenderyear } = course;
  const msg = `You have left ${title} for ${semester} ${calenderyear}!`;
  notify(id, msg);
  sendEmail(id, 'Left a Course', msg);
});

/**
 * request to add a notification for removing a user to a course
 * @param {object} course - object for the course
 * @param {integer} userId
 * @param {boolean} isInstructor - boolean for is the account is an instructor
 */
exports.removeStaff = catchAsync(async (course, userId, isInstructor) => {
  const { title, semester, calenderyear, courseid } = course;
  const { rows: user } = await query(
    'SELECT * FROM account WHERE accountId = $1',
    [userId],
  );
  const role = isInstructor ? 'Instructor' : 'Staff member';
  const msg = `${role} ${user[0].uname} has been removed from ${title}, ${semester} ${calenderyear}`;

  // Notify staff
  const staff = await query('SELECT * FROM isStaff WHERE courseId = $1', [
    courseid,
  ]);
  await staff.rows.forEach(async (s) => {
    await notify(s.accountid, msg);
  });
});

/**
 * request to add a notification for a users registration
 * @param {object} registrationInfo
 */
const registrationNotification = async (registrationInfo) => {
  const { accountid, starttime, startdate, hostnames, courseid } =
    registrationInfo;
  const when = `${startdate.toString().substr(0, 15)} at ${starttime}`;
  let hosts = '';
  hostnames.forEach((name) => {
    hosts += name;
  });
  hosts.trimEnd();
  const course = await query('SELECT * from course where courseid = $1', [
    courseid,
  ]);
  const { title } = course.rows[0];
  return {
    accountid,
    when,
    hosts,
    title,
  };
};

/**
 * notification for adding a user to the no show list
 * @param {object} registrationInfo
 */
exports.addToNoShow = catchAsync(async (registrationInfo) => {
  const { accountid, when, hosts, title } = await registrationNotification(
    registrationInfo,
  );
  notify(
    accountid,
    `You have been marked as "No Show" for ${hosts}'s office hours on ${when} for ${title}.`,
  );
});

/**
 * notification for removing a user to the queue
 * @param {object} registrationInfo
 */
exports.removeFromQueue = catchAsync(async (registrationInfo) => {
  const { accountid, when, hosts, title } = await registrationNotification(
    registrationInfo,
  );
  const msg = `Thank you for attending ${hosts}'s office hours on ${when} for ${title}!`;
  notify(accountid, msg);
  sendEmail(
    accountid,
    'Thank you for attending',
    `${msg} Please leave any feedback on how the office hour went on the app.`,
  );
});

/**
 * request to add a notification when a course is deleted
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
exports.courseDeleted = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  // Create msg with course info
  const { rows: course } = await query(
    'SELECT * FROM course WHERE courseId = $1',
    [courseId],
  );
  const { title, semester, calenderyear } = course[0];
  const msg = `Your ${title}, ${semester} ${calenderyear} course has been deleted`;
  // Notify students
  const students = await query('SELECT * FROM isStudent WHERE courseId = $1', [
    courseId,
  ]);
  await students.rows.forEach(async (student) => {
    await notify(student.accountid, msg);
  });
  // Notify staff
  const staff = await query('SELECT * FROM isStaff WHERE courseId = $1', [
    courseId,
  ]);
  await staff.rows.forEach(async (s) => {
    await notify(s.accountid, msg);
  });
  next();
});
