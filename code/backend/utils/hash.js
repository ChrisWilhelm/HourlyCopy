const bcrypt = require('bcrypt');

exports.hash = async (data) => {
  const salt = await bcrypt.genSalt(10);
  const value = await bcrypt.hash(data, salt);
  return value;
};

exports.compare = async (data, encrypted) => {
  const isMatch = await bcrypt.compare(data, encrypted);
  return isMatch;
};
