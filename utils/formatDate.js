const formatISODate = (date) => {
  const parsedDate = new Date(date);

  // Check if the date is valid
  if (parsedDate.toString() === "Invalid Date") {
    throw new TypeError("Invalid date format");
  }

  return parsedDate.toISOString();
};

module.exports = { formatISODate };
