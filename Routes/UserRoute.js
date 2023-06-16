const express = require("express");
const router = express.Router();

const {
  createUser,
  getUser,
  allUser,
  deleteUser,
  updateUser,
  singleUser,
} = require("../Controllers/userController");
// const { protect } = require("../MiddleWare/authMiddleWare");
// const { adminProtect } = require("../MiddleWare/adminMiddleWare");

router.post("/", createUser);
router.get("/user", getUser);
router.get("/all", allUser); // adminProtect,
router.get("/:id", singleUser);
router.delete("/:id", deleteUser); //protect,
router.patch("/:id", updateUser); //protect,

module.exports = router;
