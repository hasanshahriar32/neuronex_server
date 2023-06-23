const express = require("express");
const router = express.Router();

const { generateResponse } = require("../Controllers/promptController");

// const {} = require("../Controllers/userController");

router.get("/prompt", generateResponse);

module.exports = router;
