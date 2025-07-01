const express = require("express");
const router = express.Router();
const aiController = require('../controllers/aiController')

router.post('/ai', (req,res) => {
    console.log('hello');
})
module.exports = router;
