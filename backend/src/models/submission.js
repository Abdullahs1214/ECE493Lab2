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

function createDraft({
  userId,
  title,
  abstract,
  authors,
  keywords,
  manuscriptFile
}) {
  return createSubmission({
    userId,
    title: title || null,
    abstract: abstract || null,
    authors: authors || null,
    keywords: keywords || null,
    manuscriptFile: manuscriptFile || null,
    status: 'draft'
  });
}

function updateDraftById({
  submissionId,
  userId,
  title,
  abstract,
  authors,
  keywords,
  manuscriptFile
}) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE submissions
      SET title = ?, abstract = ?, authors = ?, keywords = ?, manuscript_file = ?, status = 'draft'
      WHERE id = ? AND user_id = ?
    `;
    const params = [title || null, abstract || null, authors || null, keywords || null, manuscriptFile || null, submissionId, userId];
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ updated: this.changes > 0 });
    });
  });
}

function findSubmissionById({ submissionId, userId }) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, user_id, title, abstract, authors, keywords, manuscript_file, status
      FROM submissions
      WHERE id = ? AND user_id = ?
    `;
    db.get(sql, [submissionId, userId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

module.exports = { createSubmission, createDraft, updateDraftById, findSubmissionById };
