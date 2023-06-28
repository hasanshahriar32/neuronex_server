const express = require("express");
const router = express.Router();

const {
  generateSession,
  allSession,
  favoriteSession,
  singleSession,
} = require("../Controllers/sessionController");

router.post("/all", allSession);
router.post("/favorite", favoriteSession);
router.post("/single", singleSession);
router.post("/", generateSession);

module.exports = router;
