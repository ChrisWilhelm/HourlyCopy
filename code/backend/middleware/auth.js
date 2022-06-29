const { StatusCodes } = require('http-status-codes');
const { verifyToken } = require('../utils/token');

/**
 * checks if the token is a match for the user
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
module.exports = (req, res, next) => {
  // Get token from header
  const { token } = req;
  // Check if not token
  if (!token) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    verifyToken(token, (error, decoded) => {
      if (error) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ msg: 'Token is not valid' });
      }
      req.user = decoded.user;
      next();
    });
  } catch (err) {
    console.error('something wrong with auth middleware');
    res.status(StatusCodes.BAD_GATEWAY).json({ msg: 'Server Error' });
  }
};
