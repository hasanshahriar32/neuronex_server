const asyncHandler = require("express-async-handler");
const Transaction = require("../Model/transactionModel");

const allTransaction = async (req, res) => {
  const uid = req.params.uid;
  const transaction = await Transaction.findOne({ uid }).select("-dailyUsed");

  res.send(transaction);
};

module.exports = {
  allTransaction,
};
