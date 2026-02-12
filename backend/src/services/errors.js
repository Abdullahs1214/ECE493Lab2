function sendError(res, status, code, message, extra) {
  const payload = { error: { code, message } };
  if (extra) {
    payload.error.details = extra;
  }
  return res.status(status).json(payload);
}

function sendSuccess(res, payload) {
  return res.status(200).json(payload);
}

module.exports = { sendError, sendSuccess };
