const express = require("express")
const router = express.Router();
const budgetController = require('../controllers/budgetController')
const { protect } = require('../middleware/authMiddleware');

//add budget
router.post('/', protect, budgetController.AddBudget);

//edit budget
router.put('/:id', protect, budgetController.UpdateBudget);
//delete budget
router.delete("/:id", protect, budgetController.DeleteBudget);
//all budget
router.get("/", protect, budgetController.GetAllBudget);

module.exports = router;