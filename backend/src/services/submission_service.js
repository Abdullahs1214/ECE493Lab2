const submissionModel = require('../models/submission');
const { validateMetadata, validateManuscriptFile } = require('./validation');

const SUBMISSION_STATUS_SUBMITTED = 'submitted';

async function submitSubmission({ userId, metadata, manuscriptFile }) {
  const metaResult = validateMetadata(metadata);
  if (!metaResult.ok) {
    return metaResult;
  }

  const fileResult = validateManuscriptFile(manuscriptFile);
  if (!fileResult.ok) {
    return fileResult;
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  if (process.env.SIMULATE_FILE_STORAGE_FAILURE === 'true') {
    return { ok: false, code: 'file_storage_error', message: 'File storage unavailable.' };
  }

  try {
    const result = await submissionModel.createSubmission({
      userId,
      title: metadata.title,
      abstract: metadata.abstract,
      authors: metadata.authors,
      keywords: metadata.keywords,
      manuscriptFile: manuscriptFile.filename,
      status: SUBMISSION_STATUS_SUBMITTED
    });

    return { ok: true, submissionId: result.id };
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }
}

module.exports = { submitSubmission };
