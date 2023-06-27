const express = require("express");
const router = express.Router();

const {
  generateSession,
  allSession,
} = require("../Controllers/sessionController");

router.post("/all", allSession);
router.post("/", generateSession);

module.exports = router;
