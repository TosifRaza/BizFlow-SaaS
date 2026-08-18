const normalizeId = (data) => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(normalizeId);
  if (typeof data === 'object' && data._id) {
    if (!data.id) data.id = String(data._id);
  }
  return data;
};

const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: normalizeId(data),
  });
};

const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errorCode = null) => {
  const response = {
    success: false,
    message,
  };
  if (errorCode) {
    response.errorCode = errorCode;
  }
  return res.status(statusCode).json(response);
};

const paginateResponse = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message: 'Success',
    data: normalizeId(data),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { successResponse, errorResponse, paginateResponse };