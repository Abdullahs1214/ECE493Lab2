function apiNotFound(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: {
        code: 'endpoint_not_found',
        message: 'API endpoint not found.'
      }
    });
  }
  return next();
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'invalid_json',
        message: 'Invalid JSON payload.'
      }
    });
  }

  return res.status(500).json({
    error: {
      code: 'internal_error',
      message: 'Internal server error.'
    }
  });
}

module.exports = { apiNotFound, errorHandler };
