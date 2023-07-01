const express = require("express");
const router = express.Router();

const {
  generateSession,
  allSession,
  favoriteSession,
  singleSession,
  makeFavorite,
} = require("../Controllers/sessionController");

router.post("/all", allSession);
router.post("/favorite", favoriteSession);
router.post("/single", singleSession);
router.post("/favorite/switch", makeFavorite);
router.post("/", generateSession);

module.exports = router;
