const express = require("express");
const {
  allPackage,
  createPackage,
  deletePackage,
} = require("../Controllers/packageController");
const { adminProtect } = require("../MiddleWare/adminMiddleWare");
const router = express.Router();

router.get("/all", allPackage);
router.post("/create", adminProtect, createPackage);
router.delete("/:id", adminProtect, deletePackage);

module.exports = router;
