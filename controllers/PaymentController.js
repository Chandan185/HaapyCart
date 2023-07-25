const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//processing payments after checkout
exports.processPayments = catchAsyncErrors(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    metadata: { integration_check: "accept_a_payment" },
  });
  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

//sending stripe api key to frontend
exports.getstripeapikey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    stripeapikey: `${process.env.STRIPE_API_KEY}`,
  });
});
