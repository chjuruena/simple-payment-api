require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const paymentService = require('./paymentService');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure logs directory exists
const ensureLogsDirectory = () => {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
};
ensureLogsDirectory();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client')));

// SSL enforcement middleware (for production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

// Request logging middleware
app.use((req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    body: req.body
  };
  
  fs.appendFileSync(
    path.join(__dirname, 'logs', 'requests.log'),
    JSON.stringify(logData) + '\n'
  );
  
  next();
});
app.get('/api/config', (req, res) => {
    res.json({
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      // Can add other frontend config here
    });
  });
// API Endpoints
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    console.log('Creating payment intent for amount:', amount);
    const paymentIntent = await paymentService.createPaymentIntent(amount, currency);
    console.log('Payment intent created:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    console.log('Confirming payment:', paymentIntentId);
    const result = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);
    console.log('Payment confirmed:', result.id, 'Status:', result.status);
    res.json(result);
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend - Updated for Express 5
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Handle 404 - Updated for Express 5
app.all('/{*any}', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    body: req.body
  };
  
  fs.appendFileSync(
    path.join(__dirname, 'logs', 'errors.log'),
    JSON.stringify(errorLog) + '\n'
  );
  
  console.error('Server Error:', errorLog);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'))
  };
  https.createServer(sslOptions, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}