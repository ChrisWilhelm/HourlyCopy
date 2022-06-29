const fs = require('fs');
const { query } = require('./db');

// Function to initialize the db with schema and storedProcedures
// This will delete all of your current data!
const init = async () => {
  try {
    const schemas = fs.readFileSync('./schema.sql').toString();
    const storedProcedures = fs
      .readFileSync('./storedProcedures.sql')
      .toString();

    await query(schemas);
    await query(storedProcedures);
  } catch (err) {
    console.log(err);
  }
};

init().then(console.log('Done'));
