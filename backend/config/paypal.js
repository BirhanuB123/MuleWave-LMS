
const paypal = require('paypal-rest-sdk');

// Normalize PAYPAL_MODE and provide a safe default
const rawMode = process.env.PAYPAL_MODE;
const mode = (rawMode && typeof rawMode === 'string') ? rawMode.trim().toLowerCase() : 'sandbox';
if (mode !== 'sandbox' && mode !== 'live') {
  console.warn("PAYPAL_MODE is invalid; falling back to 'sandbox'. Received:", rawMode);
}

paypal.configure({
  mode: (mode === 'live') ? 'live' : 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

module.exports = paypal;
