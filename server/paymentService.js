const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

// Create stripe-logs directory if it doesn't exist
const stripeLogsDir = path.join(__dirname, 'stripe-logs');
if (!fs.existsSync(stripeLogsDir)) {
  fs.mkdirSync(stripeLogsDir);
}

class PaymentService {
  async logStripeResponse(method, response) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method,
      response: {
        id: response.id,
        status: response.status,
        amount: response.amount,
        currency: response.currency,
        metadata: response.metadata
      }
    };
    
    fs.appendFileSync(
      path.join(stripeLogsDir, 'stripe-responses.log'),
      JSON.stringify(logEntry) + '\n'
    );
  }

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
      });
      
      await this.logStripeResponse('createPaymentIntent', paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const confirmedIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        { payment_method: paymentMethodId }
      );
      
      await this.logStripeResponse('confirmPayment', confirmedIntent);
      return confirmedIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();