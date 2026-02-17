const db = require('../models/db');
const scheduleItemModel = require('../models/schedule_item');

const DEFAULT_ROOMS = ['Room A', 'Room B', 'Room C'];
const DEFAULT_TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00'];

function getAcceptedSubmissionIds() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT s.id AS submission_id
      FROM submissions s
      JOIN decisions d ON d.submission_id = s.id
      WHERE d.decision_outcome = 'accept'
      ORDER BY s.id
    `;
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((rows || []).map((row) => row.submission_id));
    });
  });
}

function hasTimeRoomConflicts(items) {
  const seen = new Set();
  for (const item of items) {
    const key = `${item.timeAssignment}::${item.roomAssignment}`;
    if (seen.has(key)) {
      return true;
    }
    seen.add(key);
  }
  return false;
}

function buildGeneratedItems(submissionIds) {
  const generated = [];
  let index = 0;
  for (const submissionId of submissionIds) {
    const roomIndex = index % DEFAULT_ROOMS.length;
    const timeIndex = Math.floor(index / DEFAULT_ROOMS.length);
    generated.push({
      submissionId,
      roomAssignment: DEFAULT_ROOMS[roomIndex],
      timeAssignment: DEFAULT_TIME_SLOTS[timeIndex]
    });
    index += 1;
  }
  return generated;
}

async function generateSchedule() {
  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Schedule generation failed.' };
  }

  let acceptedSubmissionIds;
  try {
    acceptedSubmissionIds = await getAcceptedSubmissionIds();
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Schedule generation failed.' };
  }

  if (acceptedSubmissionIds.length === 0) {
    return { ok: false, code: 'no_accepted_papers', message: 'No accepted papers available for scheduling.' };
  }

  if (process.env.SIMULATE_NO_SCHEDULING_RESOURCES === 'true') {
    return { ok: false, code: 'no_resources', message: 'Scheduling resources are missing.' };
  }

  if (process.env.SIMULATE_UNSATISFIED_CONSTRAINTS === 'true') {
    return { ok: false, code: 'unsatisfied_constraints', message: 'Scheduling constraints cannot be satisfied.' };
  }

  if (acceptedSubmissionIds.length > DEFAULT_ROOMS.length * DEFAULT_TIME_SLOTS.length) {
    return { ok: false, code: 'unsatisfied_constraints', message: 'Scheduling constraints cannot be satisfied.' };
  }

  const generatedItems = buildGeneratedItems(acceptedSubmissionIds);

  try {
    await scheduleItemModel.clearScheduleItems();
    for (const item of generatedItems) {
      await scheduleItemModel.createScheduleItem(item);
    }
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Schedule generation failed.' };
  }

  return { ok: true, generatedCount: generatedItems.length };
}

async function modifySchedule({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, code: 'invalid_modification', message: 'Schedule modification is invalid.' };
  }

  const normalized = [];
  for (const item of items) {
    const submissionId = Number(item && item.submissionId);
    const timeAssignment = item && item.timeAssignment;
    const roomAssignment = item && item.roomAssignment;

    if (!Number.isInteger(submissionId) || submissionId <= 0 || !timeAssignment || !roomAssignment) {
      return { ok: false, code: 'invalid_modification', message: 'Schedule modification is invalid.' };
    }

    normalized.push({ submissionId, timeAssignment, roomAssignment });
  }

  if (hasTimeRoomConflicts(normalized)) {
    return { ok: false, code: 'conflict', message: 'Scheduling conflict detected.' };
  }

  if (process.env.SIMULATE_SCHEDULE_CONSTRAINT_VIOLATION === 'true') {
    return { ok: false, code: 'constraint_violation', message: 'Schedule violates required constraints.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Schedule update failed.' };
  }

  try {
    for (const item of normalized) {
      const updated = await scheduleItemModel.updateScheduleItemBySubmissionId(item);
      if (!updated.updated) {
        return { ok: false, code: 'invalid_modification', message: 'Schedule modification is invalid.' };
      }
    }
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Schedule update failed.' };
  }

  return { ok: true, updatedCount: normalized.length };
}

async function publishSchedule() {
  if (process.env.SIMULATE_SCHEDULE_RETRIEVAL_FAILURE === 'true') {
    return { ok: false, code: 'retrieval_failure', message: 'Schedule retrieval failure.' };
  }

  let scheduleItems;
  try {
    scheduleItems = await scheduleItemModel.getAllScheduleItems();
  } catch (err) {
    return { ok: false, code: 'retrieval_failure', message: 'Schedule retrieval failure.' };
  }

  if (scheduleItems.length === 0) {
    return { ok: false, code: 'retrieval_failure', message: 'Schedule retrieval failure.' };
  }

  if (process.env.SIMULATE_WEB_PUBLISH_FAILURE === 'true') {
    return { ok: false, code: 'publishing_failure', message: 'Web publishing failure.' };
  }

  if (process.env.SIMULATE_AUTHOR_ACCESS_FAILURE === 'true') {
    return { ok: false, code: 'author_access_failure', message: 'Author access failure.' };
  }

  return { ok: true, published: true, visibleToAuthors: true, itemCount: scheduleItems.length };
}

module.exports = {
  generateSchedule,
  modifySchedule,
  publishSchedule,
  DEFAULT_ROOMS,
  DEFAULT_TIME_SLOTS
};
