/* Function to wrap asynchronous functions so that we don't need
  try-catch for everything.
  Source: https://github.com/jonasschmedtmann/complete-node-bootcamp/blob/master/4-natours/after-section-14/utils/catchAsync.js
*/
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
