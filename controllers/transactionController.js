const Transaction = require("../models/Transaction");

exports.getOverview = async (req, res) => {
  const { email } = req.user;

  try {
    const transactions = await Transaction.find({ email });

    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        income += transaction.amount;
      } else if (transaction.type === "expense") {
        expense += transaction.amount;
      }
    });

    const balance = income - expense;

    // Return the data as JSON
    res.json({ income, expense, balance });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching overview" });
  }
};

const addTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date } = req.body;
    const user = req.user;

    if (!type || !category || !amount || !description || !date) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'income' or 'expense'",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number greater than 0",
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    const transaction = await Transaction.create({
      type: type.toLowerCase(),
      category,
      amount,
      description,
      date: parsedDate,
      email: user.email,
      name: user.name,
      userId: user._id,
    });

    res
      .status(201)
      .json({ success: true, data: transaction, message: "Transaction added" });
  } catch (err) {
    next(err);
  }
};

module.exports = { addTransaction, getOverview };
