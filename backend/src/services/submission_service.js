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

function hasSufficientDraftInformation(metadata, manuscriptFile) {
  const metadataHasValue = metadata && typeof metadata === 'object' && Object.values(metadata).some((value) => {
    return value !== null && value !== undefined && String(value).trim().length > 0;
  });
  const fileHasValue = !!(manuscriptFile && manuscriptFile.filename);
  return metadataHasValue || fileHasValue;
}

async function saveDraft({ submissionId, userId, metadata, manuscriptFile }) {
  if (!hasSufficientDraftInformation(metadata, manuscriptFile)) {
    return { ok: false, code: 'draft_insufficient', message: 'Insufficient draft information.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  if (process.env.SIMULATE_FILE_STORAGE_FAILURE === 'true' && manuscriptFile && manuscriptFile.filename) {
    return { ok: false, code: 'file_storage_error', message: 'File storage unavailable.' };
  }

  try {
    const draftPayload = {
      userId,
      title: metadata && metadata.title,
      abstract: metadata && metadata.abstract,
      authors: metadata && metadata.authors,
      keywords: metadata && metadata.keywords,
      manuscriptFile: manuscriptFile && manuscriptFile.filename
    };

    let result;
    if (!submissionId || submissionId === 'new') {
      result = await submissionModel.createDraft(draftPayload);
    } else {
      const updateResult = await submissionModel.updateDraftById({
        submissionId: Number(submissionId),
        ...draftPayload
      });
      if (!updateResult.updated) {
        return { ok: false, code: 'draft_not_found', message: 'Draft not found.' };
      }
      result = { id: Number(submissionId) };
    }

    return { ok: true, submissionId: result.id };
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }
}

async function validateSubmissionData({ metadata, manuscriptFile }) {
  if (process.env.SIMULATE_VALIDATION_FAILURE === 'true') {
    return { ok: false, code: 'validation_failure', message: 'Validation failed due to system error.' };
  }

  const metadataResult = validateMetadata(metadata);
  if (!metadataResult.ok) {
    return metadataResult;
  }

  const fileResult = validateManuscriptFile(manuscriptFile);
  if (!fileResult.ok) {
    return fileResult;
  }

  return { ok: true };
}

module.exports = { submitSubmission, saveDraft, validateSubmissionData };
