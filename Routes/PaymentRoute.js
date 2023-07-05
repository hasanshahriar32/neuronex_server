const express = require("express");
const router = express.Router();

const { protect } = require("../MiddleWare/authMiddleWare");
const { adminProtect } = require("../MiddleWare/adminMiddleWare");
const { createIntent } = require("../Controllers/paymentController");

router.post("/create-intent", createIntent);

module.exports = router;
