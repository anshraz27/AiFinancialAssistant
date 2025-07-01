const express = require("express")
const router = express.Router();
const reportController = require("../controllers/reportController");

router.post("/report", (req, res) => {
  console.log("hello");
});

module.exports = router;