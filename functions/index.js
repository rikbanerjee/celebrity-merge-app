const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const {defineSecret} = require("firebase-functions/params");

// Define the secret
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

// Initialize Stripe with error handling
let stripe;
try {
  // Get Stripe key from secrets (Firebase Functions v2)
  const stripeKey = stripeSecretKey.value() ||
    "sk_test_your_test_key_here";

  logger.info("Using Stripe key:", stripeKey ? "Present" : "Missing");
  logger.info("Stripe key value:", stripeKey);
  stripe = require("stripe")(stripeKey);
} catch (error) {
  logger.error("Failed to initialize Stripe:", error);
  stripe = null;
}

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Set global options for cost control
setGlobalOptions({maxInstances: 10});

// CORS helper function
const cors = (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
};

// Create Payment Intent
exports.createPaymentIntent = onRequest({
  secrets: [stripeSecretKey],
}, async (req, res) => {
  if (cors(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    if (!stripe) {
      res.status(500).json({error: "Stripe not initialized"});
      return;
    }

    const {amount, currency, metadata} = req.body;

    logger.info("Creating payment intent", {amount, currency, metadata});

    // Validate required fields
    if (!amount || !currency) {
      res.status(400).json({error: "Amount and currency are required"});
      return;
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info("Payment intent created", {id: paymentIntent.id});

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error("Error creating payment intent", error);
    res.status(500).json({error: "Failed to create payment intent"});
  }
});

// Update User Usage
exports.updateUsage = onRequest({
  secrets: [stripeSecretKey],
}, async (req, res) => {
  if (cors(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    if (!stripe) {
      res.status(500).json({error: "Stripe not initialized"});
      return;
    }

    const {userId, paymentIntentId, uses} = req.body;

    logger.info("Updating usage", {userId, paymentIntentId, uses});

    // Validate required fields
    if (!userId || !paymentIntentId || !uses) {
      res.status(400).json({
        error: "userId, paymentIntentId, and uses are required",
      });
      return;
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      res.status(400).json({error: "Payment not completed"});
      return;
    }

    // Update user's usage in Firestore
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document
      await userRef.set({
        usageCount: 0,
        totalUses: parseInt(uses),
        lastUsed: new Date(),
        createdAt: new Date(),
        paymentHistory: [{
          paymentIntentId: paymentIntentId,
          uses: parseInt(uses),
          amount: paymentIntent.amount,
          timestamp: new Date(),
        }],
      });
    } else {
      // Update existing user document
      const currentData = userDoc.data();
      await userRef.update({
        usageCount: 0, // Reset usage count after payment
        totalUses: (currentData.totalUses || 0) + parseInt(uses),
        lastUsed: new Date(),
        paymentHistory: [
          ...(currentData.paymentHistory || []),
          {
            paymentIntentId: paymentIntentId,
            uses: parseInt(uses),
            amount: paymentIntent.amount,
            timestamp: new Date(),
          },
        ],
      });
    }

    logger.info("Usage updated successfully", {userId, uses});

    res.json({
      success: true,
      message: "Usage updated successfully",
      newUsageCount: 0,
      totalUses: parseInt(uses),
    });
  } catch (error) {
    logger.error("Error updating usage", error);
    res.status(500).json({error: "Failed to update usage"});
  }
});

// Webhook for Stripe events (optional but recommended)
exports.stripeWebhook = onRequest({
  secrets: [stripeSecretKey],
}, async (req, res) => {
  if (cors(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      logger.warn("Stripe webhook secret not configured");
      res.status(400).json({error: "Webhook secret not configured"});
      return;
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.error("Webhook signature verification failed", err);
      res.status(400).json({error: "Invalid signature"});
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        logger.info("Payment succeeded", {id: paymentIntent.id});
        // You can add additional logic here if needed
        break;
      }
      case "payment_intent.payment_failed": {
        const failedPayment = event.data.object;
        logger.warn("Payment failed", {id: failedPayment.id});
        // You can add additional logic here if needed
        break;
      }
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    logger.error("Error processing webhook", error);
    res.status(500).json({error: "Webhook processing failed"});
  }
});
