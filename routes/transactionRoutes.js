const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  validateTransaction,
  validateObjectId,
} = require("../middleware/validateMiddleware");
const transactionController = require("../controllers/transactionController");

router.use(auth);

router.post("/", validateTransaction, transactionController.addTransaction);
router.get("/", transactionController.getMyTransactions);
router.get("/reports", transactionController.reports);
router.get("/:id", validateObjectId, transactionController.getTransactionById);
router.put(
  "/:id",
  validateObjectId,
  validateTransaction,
  transactionController.updateTransaction
);
router.delete(
  "/:id",
  validateObjectId,
  transactionController.deleteTransaction
);

router.get("/overview", transactionController.getOverview);

module.exports = router;
