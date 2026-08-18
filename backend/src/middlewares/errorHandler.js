// // const config = require('../config');

// // const errorHandler = (err, req, res, _next) => {
// //   let statusCode = err.statusCode || 500;
// //   let message = err.message || 'Internal Server Error';
// //   let errorCode = err.errorCode || 'INTERNAL_ERROR';

// //   const response = {
// //     success: false,
// //     message,
// //     errorCode,
// //   };

// //   if (err.name === 'ValidationError') {
// //     response.message = 'Validation Error';
// //     response.errorCode = 'VALIDATION_ERROR';
// //     if (err.errors) {
// //       const fieldErrors = {};
// //       for (const [field, info] of Object.entries(err.errors)) {
// //         fieldErrors[field] = info.message;
// //       }
// //       response.errors = fieldErrors;
// //     }
// //   }
// //   if (err.name === 'CastError') {
// //     response.message = 'Invalid ID format';
// //     response.errorCode = 'INVALID_ID';
// //   }
// //   if (err.name === 'MongoServerError' && err.code === 11000) {
// //     statusCode = 409;
// //     response.message = 'A record with this value already exists';
// //     response.errorCode = 'DUPLICATE_ENTRY';
// //   }

// //   if (config.env === 'development') {
// //     response.stack = err.stack;
// //   }

// //   res.status(statusCode).json(response);
// // };

// // module.exports = errorHandler;
// const config = require('../config');

// const errorHandler = (err, req, res, _next) => {
//   let statusCode = err.statusCode || 500;
//   let message = err.message || 'Internal Server Error';
//   let errorCode = err.errorCode || 'INTERNAL_ERROR';

//   const response = {
//     success: false,
//     message,
//     errorCode,
//   };

//   if (err.name === 'ValidationError') {
//     statusCode = 400;
//     response.message = 'Validation Error';
//     response.errorCode = 'VALIDATION_ERROR';
//     if (err.errors) {
//       const fieldErrors = {};
//       for (const [field, info] of Object.entries(err.errors)) {
//         fieldErrors[field] = info.message;
//       }
//       response.errors = fieldErrors;
//     }
//   }
//   if (err.name === 'CastError') {
//     response.message = 'Invalid ID format';
//     response.errorCode = 'INVALID_ID';
//   }
//   if (err.name === 'MongoServerError' && err.code === 11000) {
//     statusCode = 409;
//     response.message = 'A record with this value already exists';
//     response.errorCode = 'DUPLICATE_ENTRY';
//   }

//   if (config.env === 'development') {
//     response.stack = err.stack;
//   }

//   res.status(statusCode).json(response);
// };

// module.exports = errorHandler;
const config = require('../config');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  const response = {
    success: false,
    message,
    errorCode,
  };

  if (err.name === 'ValidationError') {
    statusCode = 400;
    response.message = 'Validation Error';
    response.errorCode = 'VALIDATION_ERROR';
    if (err.errors) {
      const fieldErrors = {};
      for (const [field, info] of Object.entries(err.errors)) {
        fieldErrors[field] = info.message;
      }
      response.errors = fieldErrors;
    }
  }
  if (err.name === 'CastError') {
    response.message = 'Invalid ID format';
    response.errorCode = 'INVALID_ID';
  }
  if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    response.message = 'A record with this value already exists';
    response.errorCode = 'DUPLICATE_ENTRY';
  }

  if (config.env === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;