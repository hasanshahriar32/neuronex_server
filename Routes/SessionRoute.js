const express = require("express");
const router = express.Router();

const {
  generateSession,
  allSession,
  favoriteSession,
  singleSession,
  makeFavorite,
  deleteSession,
} = require("../Controllers/sessionController");
const { protect } = require("../MiddleWare/authMiddleWare");

router.post("/all", allSession);
router.post("/favorite", favoriteSession);
router.post("/single", singleSession);
router.post("/favorite/switch", makeFavorite);
router.post("/", generateSession);
// router.delete("/:id", protect, deleteSession);
router.delete("/:id", deleteSession);

module.exports = router;
