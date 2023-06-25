const express = require("express");
const router = express.Router();

const { generateResponse } = require("../Controllers/promptController");

// const {} = require("../Controllers/userController");

router.post("/", generateResponse);

module.exports = router;
