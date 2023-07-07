const asyncHandler = require("express-async-handler");
const Package = require("../Model/packageModel");
const Payment = require("../Model/paymentModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createIntent = asyncHandler(async (req, res) => {
    const { id } = req.body;
    const package = await Package.findById(id);
    const price = package.price;
    // Create a PaymentIntent with the order amount and currency
    if (price) {
        const amount = price * 100;
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
    }
});
const resolveIntent = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { _id, paymentID, uid } = req.body;
    // search for the package and get amount
    // const package = await Package.findById(_id);
    // console.log(package);
    // Create a PaymentIntent with the order amount and currency

    const payment = await Payment.create({
        uid,
        paymentID,
        packageID: _id,
        plan: package?.plan,
        price: package?.price,
        estimatedGeneration: package?.estimatedGeneration,
        validity: package?.validity,
        status: "Confirmed",
    });
    if (payment) {
        res.status(201).json({
            _id: payment._id,
            uid: payment.uid,
            packageID: payment.packageID,
            paymentID: payment.paymentID,
            plan: payment.plan,
            price: payment.price,
            estimatedGeneration: payment.estimatedGeneration,
            validity: payment.validity,
            status: payment.status,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});
module.exports = { createIntent, resolveIntent };
