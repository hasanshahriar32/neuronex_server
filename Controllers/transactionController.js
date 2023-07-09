const asyncHandler = require("express-async-handler");
const Transaction = require("../Model/transactionModel");

const allTransaction = async (req, res) => {
  const { uid } = req.body;
  const transaction = await Transaction.find({ uid })
    .select("-dailyUsed")
    .sort({ createdAt: -1 });

  res.send(transaction);
};
const allUserTransaction = async (req, res) => {
  const { uid } = req.body;
  const transaction = await Transaction.find({ uid }).select("-dailyUsed");

  res.send(transaction);
};

module.exports = {
  allTransaction,
  allUserTransaction,
};
