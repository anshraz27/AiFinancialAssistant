const express = require("express")
const router = express.Router();
const budgetController = require('../controllers/budgetController')

router.post("/budget", (req, res) => {
  console.log("hello");
});

module.exports = router;