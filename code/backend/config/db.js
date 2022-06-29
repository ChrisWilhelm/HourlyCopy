const { Pool } = require('pg');

const pool = new Pool({
  ssl: {
    rejectUnauthorized: false,
  },
});
pool.query('SELECT NOW()', [], (err, res) => {
  if (err) {
    console.log(err);
    console.log(res);
  } else {
    console.log('Connection To DB successful!');
  }
});
module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
};
