// Authentication middleware
function authenticate(req, res, next) {
  const apiKey = req.headers["x-api-key"]; // expect header: x-api-key
  const validKey = "12345"; // pretend this is your valid key

  if (apiKey !== validKey) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or missing API key" });
  }
  next();
};

module.exports = authenticate;