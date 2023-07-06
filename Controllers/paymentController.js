const asyncHandler = require("express-async-handler");
const pricingData = require("../data/pricing.json");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createIntent = asyncHandler(async (req, res) => {
  const { id } = req.body;
  //   const price = pricingData.find((p) => p._id === id).price;
  const price = 500;
  const amount = price * 100;
  console.log(price);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
const resolveIntent = asyncHandler(async (req, res) => {
  const { packageId } = req.body;
  // search for the package and get amount
  const package = Package.findById(packageId);
  // console.log(package);
  // const amount = package.price;
  const amount = 30;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "bdt",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  const payment = await Payment.create({
    paymentID: "",
    package,
    status: "pending",
    clientSecret: paymentIntent.client_secret,
  });
  if (payment) {
    res.status(201).json({
      _id: payment._id,
      paymentID: payment.paymentID,
      package: payment.package,
      status: payment.status,
      clientSecret: paymentIntent.client_secret,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});
module.exports = { createIntent };
