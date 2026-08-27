// const express = require('express');
// const helmet = require('helmet');
// const cors = require('cors');
// const compression = require('compression');
// const morgan = require('morgan');
// const path = require('path');
// const config = require('./config');
// const routes = require('./routes');
// const errorHandler = require('./middlewares/errorHandler');
// const { apiLimiter } = require('./middlewares/rateLimiter');

// const app = express();

// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'cross-origin' },
//   contentSecurityPolicy: false,
// }));

// app.use(cors({
//   origin: config.cors.origin,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// }));

// app.use(compression());
// app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// app.use('/api', apiLimiter, routes);

// app.use((_req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found',
//     errorCode: 'NOT_FOUND',
//   });
// });

// app.use(errorHandler);

// module.exports = app;
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', apiLimiter, routes);

// API 404 handler — only for /api/* routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errorCode: 'NOT_FOUND',
  });
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// SPA fallback — serve index.html for all non-API, non-file routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(errorHandler);

module.exports = app;