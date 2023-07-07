const express = require("express");
const router = express.Router();
const {
allTransaction
} = require("../Controllers/transactionController");


router.get("/all/:uid", allTransaction);

module.exports = router;
