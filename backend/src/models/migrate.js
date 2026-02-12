const fs = require('fs');
const path = require('path');
const db = require('./db');

function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  return new Promise((resolve, reject) => {
    db.exec(schemaSql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

module.exports = { migrate };
