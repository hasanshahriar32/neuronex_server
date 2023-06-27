const express = require("express");
const router = express.Router();

const {
  generateResponse3,
} = require("../Controllers/PromptController/promptController3");
const {
  generateResponse,
} = require("../Controllers/PromptController/promptController");

// const {} = require("../Controllers/userController");

router.post("/", generateResponse3);
router.post("/prompt", generateResponse);

module.exports = router;
