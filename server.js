const express = require("express");
const app = express();
const productRoutes = require("./routes/productsRoutes.js");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(logger);

// Routes
app.use("/api/products", productRoutes);

// Error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
