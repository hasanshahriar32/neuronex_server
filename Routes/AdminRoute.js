const express = require("express");
const adminController = require("../Controllers/adminController");
const router = express.Router();


router.put('/makeUserAdmin/:id', adminController.makeUserAdmin);

module.exports = router;