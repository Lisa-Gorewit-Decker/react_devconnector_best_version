const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const rateLimit = require('express-rate-limit');

let server;

const shutdown = (error, origin) => {
  console.error(`${origin}:`, error);

  if (server && server.listening) {
    const timeout = setTimeout(() => process.exit(1), 10_000).unref();
    server.close(() => { clearTimeout(timeout); process.exit(1); });
  } else {
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  shutdown(reason, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  shutdown(error, 'Uncaught Exception');
});

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-8', // return rate-limit info in RateLimit-* headers
  legacyHeaders: false, // disable deprecated X-RateLimit-* headers
  validate: { trustProxy: false }, // trust proxy is explicitly set above; suppress warning
});

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(limiter);

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  // SPA fallback: only for non-API frontend routes
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
