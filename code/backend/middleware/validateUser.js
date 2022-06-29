const { StatusCodes } = require('http-status-codes');
const { query } = require('../config/db');
const { compare } = require('../utils/hash');
const catchAsync = require('../utils/catchAsync');

/**
 * checks if the user account exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.exists = async (req, res, next) => {
  const { id } = req.user;

  const account = await query('SELECT * from account WHERE accountid = $1', [
    id,
  ]);
  if (account.rowCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: 'Account does not exist',
    });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the inputted user account exists
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.inputExists = async (req, res, next) => {
  const { userId } = req.params;

  const account = await query('SELECT * from account WHERE accountid = $1', [
    userId,
  ]);
  if (account.rowCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: 'Inputted account does not exist',
    });
  } else {
    next();
  }
  return res;
};

/**
 * checks if the email is linked to an account
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports.emailExists = async (req, res, next) => {
  const { email } = req.body;
  const account = await query(
    'SELECT a.accountId FROM account as a where a.email = $1',
    [email],
  );
  console.log(account.rows[0]);
  if (account.rowCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: 'Account with given email does not exist',
    });
  } else {
    next();
  }
  return res;
};

module.exports.emailDoesNotExist = async (req, res, next) => {
  const { email } = req.body;
  const account = await query('SELECT * FROM account WHERE email = $1', [
    email,
  ]);
  if (account.rowCount !== 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'User already exists',
    });
  } else {
    next();
  }
  return res;
};

module.exports.hasMatchingEmailAndPassword = async (req, res, next) => {
  const { email, password } = req.body;
  const account = await query(
    'SELECT * FROM account as A WHERE LOWER(a.email) = LOWER($1)',
    [email],
  );
  const isMatch = await compare(password, account.rows[0].accountpassword);
  if (!isMatch) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Invalid Credentials',
    });
  } else {
    next();
  }
  return res;
};

module.exports.hasMatchingPassword = async (req, res, next) => {
  const { password } = req.body;
  const { id } = req.user;

  const account = await query('SELECT * FROM account WHERE accountid = $1', [
    id,
  ]);
  const isMatch = await compare(password, account.rows[0].accountpassword);
  if (!isMatch) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Invalid Credentials',
    });
  } else {
    next();
  }
  return res;
};

module.exports.emailIsNotInCourse = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const { courseId } = req.params;
  const accountId = await query(
    'SELECT accountId FROM account WHERE email = $1',
    [email],
  );
  const role = await query('SELECT getRoleInCourse($1, $2)', [
    courseId,
    accountId.rows[0].accountid,
  ]);
  if (role.rows[0].getroleincourse === 'na') {
    next();
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'User is already in course',
    });
  }
  return res;
});
