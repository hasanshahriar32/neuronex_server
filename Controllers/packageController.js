const asyncHandler = require("express-async-handler");
const Package = require("../Model/packageModel");

const createPackage = asyncHandler(async (req, res) => {
  const { plan, price, validity, estimatedGeneration } = req.body;
  console.log(req.body);
  const packageExists = await Package.findOne({ price });
  if (packageExists) {
    res.status(422).json({
      error: "Package already exists",
      _id: packageExists._id,
      packageExists,
    });
    throw new Error("Package already exists");
  }
  const package = await Package.create({
    plan,
    price,
    validity,
    estimatedGeneration,
  });
  if (package) {
    res.status(201).json({
      _id: package._id,
      plan: package.plan,
      price: package.price,
      validity: package.validity,
      estimatedGeneration: package.estimatedGeneration,
    });
  } else {
    res.status(400);
    throw new Error("Invalid package data");
  }
});

const allPackage = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  const skipIndex = (page - 1) * limit;
  const package = await Package.find().skip(skipIndex).limit(limit);

  res.send(package);
};

const deletePackage = async (req, res) => {
  const id = req.params.id;
  const package = await Package.deleteOne({ _id: id });
  res.send(package);
};

module.exports = {
  createPackage,
  allPackage,
  deletePackage,
};