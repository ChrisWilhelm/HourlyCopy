const path = require('path');
const express = require('express');
const cors = require('cors');
const bearerToken = require('express-bearer-token');
const helmet = require('helmet');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('./utils/ApiError');
require('dotenv').config({ path: './config/config.env' });

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(bearerToken());
app.use(helmet());

// routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/users/me/notifs', require('./routes/api/notifs'));
app.use('/api/courses', require('./routes/api/courses'));
app.use('/api/courses/officeHours', require('./routes/api/officeHours'));

app.all('/api/*', (req, res, next) => {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      `Can't find ${req.originalUrl} on this server!`,
    ),
  );
});
// global error handling
app.use(require('./controllers/errorController'));

// serve React app
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

module.exports = app;
