const config = require('./config');
const { connectDB } = require('./config/db');
const app = require('./app');

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`\n  BizFlow API Server`);
      console.log(`  Environment: ${config.env}`);
      console.log(`  Running on: http://localhost:${config.port}`);
      console.log(`  API prefix: http://localhost:${config.port}/api`);
      console.log(`  Health: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
