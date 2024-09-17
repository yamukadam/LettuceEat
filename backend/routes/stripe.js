// routes/stripe.js
import express from 'express';
import Stripe from 'stripe';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import foodAuthMiddleware from '../middleware/foodAuth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Onboarding route
router.get('/connect',foodAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Adjust as needed
        email: user.email,
      });

      user.stripeAccountId = account.id;
      await user.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/seller-dashboard`,
      return_url: `${process.env.FRONTEND_URL}/stripe-return`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error connecting to Stripe:', error);
    res.status(500).json({ success: false, message: 'Stripe onboarding failed' });
  }
});

router.get('/connection-status',foodAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('found userid')
    const user = await userModel.findById(userId);
    const isConnected = !!user.stripeAccountId;
    res.json({ isConnected });
  } catch (error) {
    console.error('did not found id');
    console.error('Error checking Stripe connection:', error);
    res.status(500).json({ success: false, message: 'Error checking connection status' });
  }
});

// Webhook endpoint
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.sendStatus(400);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      // Update the order status to 'Paid'
      await orderModel.findByIdAndUpdate(orderId, { payment: true, status: 'Paid' });
    }

    res.json({ received: true });
  }
);

export default router;

