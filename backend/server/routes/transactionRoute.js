const express = require("express");
const router = express.Router();
const transactionController = require('../controllers/transactionController')
const {protect} = require('../middleware/authMiddleware');

router.post("/add-txn",protect, transactionController.AddTransaction);

//edit budget
router.put('/:id',protect,transactionController.UpdateTransaction );
//delete budget
router.delete("/:id",protect, transactionController.DeleteTransaction);
//get all transactions
router.get('/',protect,transactionController.GetAllTransactions);

module.exports = router;
