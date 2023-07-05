const asyncHandler = require("express-async-handler");
const pricingData = require("../data/pricing.json");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createIntent = asyncHandler(async (req, res) => {
  const { id } = req.body;
  //   const price = pricingData.find((p) => p._id === id).price;
  const price = 500;
  const amount = price * 100;
  console.log(pricingData);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "bdt",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = { createIntent };
