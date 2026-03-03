require("./instrument.js");
const Sentry = require("@sentry/node");
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Log to file as well
    const fs = require('fs');
    fs.appendFileSync('error.log', `[${new Date().toISOString()}] UNHANDLED REJECTION: ${err.message}\nStack: ${err.stack}\n\n`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    const fs = require('fs');
    fs.appendFileSync('error.log', `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${err.message}\nStack: ${err.stack}\n\n`);
    process.exit(1);
});

// Connect to database
connectDB();

// Passport Config
require('./config/passport');

// Seed Admin
const { seedAdmin } = require('./controllers/adminAuthController');
seedAdmin();

const app = express();



// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'sentry-trace', 'baggage']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const passport = require('passport');
app.use(passport.initialize());

// Routes
console.log('Registering /api/templates routes...');
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/headings', require('./routes/headingRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/certificates', require('./routes/certificateQueueRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));



// Static Folders
const path = require('path');
// Point to the actual assets in frontend/public
const publicPath = path.join(__dirname, '..', 'frontend', 'public');
app.use('/uploads', express.static(path.join(publicPath, 'uploads')));
app.use('/showcase-filled', express.static(path.join(publicPath, 'showcase-filled')));

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    // Log detailed error to file
    const fs = require('fs');
    try {
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${req.method} ${req.url} - Error: ${err.message}\nStack: ${err.stack}\nSentry ID: ${res.sentry}\n\n`);
    } catch (fsErr) {
        console.error('Failed to write to log file:', fsErr);
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        sentry: res.sentry
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Base URL: ${process.env.BASE_URL}`);
});
