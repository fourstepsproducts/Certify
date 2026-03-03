const Sentry = require("@sentry/node");
const dotenv = require("dotenv");

// Load env vars if not already loaded
dotenv.config();

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: "development",
    sendDefaultPii: true,
    tracesSampleRate: 0.2,
});
