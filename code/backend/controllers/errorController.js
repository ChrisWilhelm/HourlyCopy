const { StatusCodes } = require('http-status-codes');

/**
 * Function to send full error response to user
 * @param {object} err - error to be sent
 * @param {object} res - response for the error
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Function to send full error response to user (prod)
 * @param {object} err - error to be sent
 * @param {object} res - response for the error
 */
const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};

/* eslint no-param-reassign: "off" */
/* eslint no-unused-vars: "off" */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
