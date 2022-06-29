// const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const { OAuth2 } = google.auth;

// Authorization
const oauth2Client = new OAuth2(
  process.env.OAUTH_CLIENT,
  process.env.OAUTH_SECRET,
);
oauth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH,
});

const accessToken = oauth2Client.getAccessToken();

// Email
console.log('Creating mail transporter...');
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.OAUTH_CLIENT,
    clientSecret: process.env.OAUTH_SECRET,
    refreshToken: process.env.OAUTH_REFRESH,
    accessToken,
  },
});

module.exports = { mailTransporter };
