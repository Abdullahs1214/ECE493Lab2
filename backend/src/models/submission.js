const db = require('./db');

function createSubmission({
  userId,
  title,
  abstract,
  authors,
  keywords,
  manuscriptFile,
  status
}) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO submissions
        (user_id, title, abstract, authors, keywords, manuscript_file, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userId,
      title,
      abstract,
      authors,
      keywords,
      manuscriptFile,
      status
    ];
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID });
    });
  });
}

module.exports = { createSubmission };
