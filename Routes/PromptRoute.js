const express = require("express");
const router = express.Router();

const {
  generateResponse2,
  config,
} = require("../Controllers/promptController2");
const { generateResponse } = require("../Controllers/promptController");

// const {} = require("../Controllers/userController");

router.post("/", generateResponse2);
router.get("/prompt", generateResponse);

module.exports = router;
