const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    paymentID: { type: String, trim: true, required: true, unique: true },
    package: {
      type: Object,
      trim: true,
      required: true,
    },
    status: { type: String, trim: true, required: true, default: "pending" },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
