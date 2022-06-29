// Source: https://github.com/cs280fa21/bookstore-api-starter/blob/main/server/util/token.js
const jwt = require('jsonwebtoken');

const createToken = async (user, expiration, callback) => {
  const payload = {
    user: {
      id: user.accountid.toString(),
    },
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: expiration || '20d',
    },
    (err, token) => callback(err, token),
  );
};

const verifyToken = async (token, callback) =>
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    callback(error, decoded);
  });

module.exports = {
  createToken,
  verifyToken,
};
