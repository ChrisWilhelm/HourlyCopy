const { StatusCodes } = require('http-status-codes');
const { hash } = require('../utils/hash');
const { createToken } = require('../utils/token');
const catchAsync = require('../utils/catchAsync');
const validate = require('../utils/checkValidation');
const { query } = require('../config/db');

/**
 * Creates a user's account
 * @param {object} req - request for the account
 * @param {object} res - response for the request
 */
exports.signup = catchAsync(async (req, res) => {
  validate(req);

  const { name, email, password, phoneNumber } = req.body;
  const hashPassword = await hash(password);
  await query('SELECT createAccount($1, $2, $3, $4)', [
    name,
    email,
    hashPassword,
    phoneNumber,
  ]);
  const user = await query('SELECT * FROM account WHERE email = $1', [email]);
  createToken(user.rows[0], '5 days', (err, token) => {
    if (err) throw err;
    res.json({ token });
  });
});

/**
 * Log's a user into their account if the credentials match
 * @param {object} req - request for the account
 * @param {object} res - response for the request
 */
exports.login = catchAsync(async (req, res) => {
  validate(req);

  const { email } = req.body;

  const user = await query(
    'SELECT * FROM account as A WHERE LOWER(a.email) = LOWER($1)',
    [email],
  );
  createToken(user.rows[0], '5 days', (err, token) => {
    if (err) throw err;
    res.json({ token });
  });
});

/**
 * Updates a users account password if the credentials match
 * @param {object} req - request for the account
 * @param {object} res - response for the request
 */
exports.updatePassword = catchAsync(async (req, res) => {
  validate(req);
  const { newPassword } = req.body;
  const { id } = req.user;

  const hashNewPassword = await hash(newPassword);
  await query('SELECT updateUserPAssword($1, $2)', [id, hashNewPassword]);
  const user = await query(
    'SELECT * FROM account as a WHERE a.accountid = $1',
    [id],
  );
  createToken(user.rows[0], '5 days', (err, token) => {
    if (err) throw err;
    res.json({ token });
  });
});

/**
 * Delete's a users account if the credentials match
 * @param {object} req - request for the account
 * @param {object} res - response for the request
 */
exports.delete = catchAsync(async (req, res) => {
  const { id } = req.user;
  const user = await query('SELECT * FROM account WHERE accountId = $1', [id]);
  const deletion = await query('SELECT deleteAccount($1)', [
    user.rows[0].email,
  ]);
  if (!deletion.rows[0].deleteaccount) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'Unsuccessful deletion from database',
    });
  }
  res.status(StatusCodes.OK).json({ msg: 'Account successfully deleted' });
});
