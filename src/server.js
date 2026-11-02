import 'dotenv/config';
import express from 'express';

const app = express();

const port = Number(process.env.PORT || 3001);
const serviceName =
  process.env.SERVICE_NAME || 'identity-service';

app.disable('x-powered-by');

// Middleware: parse incoming JSON before routes use it.
app.use(express.json({ limit: '16kb' }));

// Public endpoint: no authentication required.
app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: serviceName,
    timestamp: new Date().toISOString(),
  });
});

// Keep this after all routes.
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// Error-handling middleware must come last.
app.use((error, req, res, next) => {
  console.error(error.message);

  const status = error.status || 500;

  res.status(status).json({
    error:
      status >= 500
        ? 'Internal server error'
        : 'Invalid request',
  });
});

const server = app.listen(port, () => {
  console.log(
    `${serviceName} running at http://localhost:${port}`,
  );
});

server.on('error', (error) => {
  console.error('Server failed to start:', error.message);
  process.exit(1);
});