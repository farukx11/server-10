const validateTransaction = (req, res, next) => {
  const { type, category, amount, date } = req.body;
  const errs = [];

  // Validate 'type' - Must be either 'income' or 'expense'
  if (!type || !["income", "expense"].includes(type.toLowerCase())) {
    errs.push("Type is required and must be 'income' or 'expense'");
  }

  // Validate 'category' - Must be provided
  if (!category) {
    errs.push("Category is required");
  }

  // Validate 'amount' - Must be a number and greater than 0
  if (amount == null || isNaN(amount) || !isFinite(amount) || amount <= 0) {
    errs.push("Amount is required and must be a valid number greater than 0");
  }

  // Validate 'date' - Must be provided and a valid date
  if (!date || isNaN(new Date(date).getTime())) {
    errs.push("Date is required and must be a valid date");
  }

  // If there are errors, send a 400 response
  if (errs.length) {
    return res.status(400).json({ success: false, message: errs.join(", ") });
  }

  // If no errors, proceed to the next middleware
  next();
};

module.exports = { validateTransaction };
