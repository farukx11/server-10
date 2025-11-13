const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  validateTransaction,
  validateObjectId,
} = require("../middleware/validateMiddleware");
const transactionController = require("../controllers/transactionController");

// Apply auth middleware to all routes
router.use(auth);

// Create new transaction
router.post("/", validateTransaction, transactionController.addTransaction);

// Get all transactions with query params for sorting, ordering, and filtering by month
router.get("/", transactionController.getMyTransactions);

// Get transaction reports (aggregated data for categories or monthly totals)
router.get("/reports", transactionController.reports);

// Get transaction by ID
router.get("/:id", validateObjectId, transactionController.getTransactionById);

// Update transaction by ID
router.put(
  "/:id",
  validateObjectId,
  validateTransaction,
  transactionController.updateTransaction
);

// Delete transaction by ID
router.delete(
  "/:id",
  validateObjectId,
  transactionController.deleteTransaction
);

module.exports = router;
