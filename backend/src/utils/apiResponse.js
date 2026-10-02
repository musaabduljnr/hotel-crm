function successResponse(res, statusCode, payload = {}) {
  return res.status(statusCode).json({
    success: true,
    ...payload,
  });
}

function errorResponse(res, statusCode, code, message, details = null) {
  const body = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    body.error.details = details;
  }

  return res.status(statusCode).json(body);
}

module.exports = { successResponse, errorResponse };
