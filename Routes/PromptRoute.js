const express = require("express");
const router = express.Router();

const {
  generateResponse,
  generateSuggestions,
} = require("../Controllers/PromptController/promptController");
const {
  generateResponse3,
} = require("../Controllers/PromptController/test/promptController3");
const {
  generateTest,
} = require("../Controllers/PromptController/test/promptTest");

// const {} = require("../Controllers/userController");

router.post("/", generateResponse3);
router.post("/prompt", generateResponse);
router.post("/suggestions", generateSuggestions);
router.get("/test", generateTest);

module.exports = router;
