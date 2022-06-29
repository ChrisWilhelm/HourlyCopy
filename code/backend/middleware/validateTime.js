/**
 * checks if the time is valid
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isTime = (req, res, next) => {
  const { startTime, endTime } = req.body;
  // HH:MM
  const starts = startTime.split(':');
  const ends = endTime.split(':');
  if (starts[0] < 0 || starts[0] > 23 || ends[0] < 0 || ends[0] > 23) {
    res.status(400).json({ msg: 'ERROR: invalid hour in time' });
  } else if (starts[1] < 0 || starts[1] > 59 || ends[1] < 0 || ends[1] > 59) {
    res.status(400).json({ msg: 'ERROR: invalid minute in time' });
  } else if (
    ends[0] < starts[0] ||
    (ends[0] === starts[0] && starts[1] > ends[1])
  ) {
    res.status(400).json({ msg: 'ERROR: end time is before start time' });
  } else {
    next();
  }
  return res;
};

/**
 * checks if date is in range
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.isDateInTimeRange = (req, res, next) => {
  const { startTime, endTime } = req.body;
  const [startHour, startMin] = startTime.split(':');
  const [endHour, endMin] = endTime.split(':');
  const { officeHour } = req;
  const start = new Date(officeHour.startTime);
  const end = new Date(officeHour.endTime);
  if (
    1 * startHour < start.getHours() ||
    (1 * startHour === start.getHours() && 1 * startMin < start.getMinutes())
  ) {
    res
      .status(400)
      .json({ msg: 'ERROR: start time is outside of scheduled office hours' });
  } else if (
    1 * endHour > end.getHours() ||
    (1 * endHour === end.getHours() && 1 * endMin > end.getMinutes())
  ) {
    res
      .status(400)
      .json({ msg: 'ERROR: end time is outside of scheduled office hours' });
  } else {
    next();
  }
  return res;
};
