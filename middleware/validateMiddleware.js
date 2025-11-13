const validateTransaction = (req, res, next) => {
  const { type, category, amount, date } = req.body;
  const errs = [];

  if (!type || !["income", "expense"].includes(type.toLowerCase())) {
    errs.push("Type is required and must be 'income' or 'expense'");
  }

  if (!category) {
    errs.push("Category is required");
  }

  if (amount == null || isNaN(amount) || !isFinite(amount) || amount <= 0) {
    errs.push("Amount is required and must be a valid number greater than 0");
  }

  if (!date || isNaN(new Date(date).getTime())) {
    errs.push("Date is required and must be a valid date");
  }

  if (errs.length) {
    return res.status(400).json({ success: false, message: errs.join(", ") });
  }

  next();
};

module.exports = { validateTransaction };
