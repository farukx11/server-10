const addTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date } = req.body;
    const user = req.user;

    // Validate inputs
    if (!type || !category || !amount || !description || !date) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate type - must be 'income' or 'expense'
    if (!["income", "expense"].includes(type.toLowerCase())) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Type must be 'income' or 'expense'",
        });
    }

    // Validate amount - must be a number and greater than 0
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Amount must be a valid number greater than 0",
        });
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    // Create the transaction
    const transaction = await Transaction.create({
      type: type.toLowerCase(),
      category,
      amount,
      description,
      date: parsedDate, // Store parsed date directly
      email: user.email,
      name: user.name,
      userId: user._id,
    });

    res
      .status(201)
      .json({ success: true, data: transaction, message: "Transaction added" });
  } catch (err) {
    next(err); // Pass the error to the global error handler
  }
};
