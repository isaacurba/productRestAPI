// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// - Request logging middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// - Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== "mySecretApiKey") {
    return res.status(401).json({ message: "Unauthorized: invalid API key" });
  }
  next();
};

// validation middleware
const validateProduct = (req, res, next) => {
  const { name, price, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({
      message: "Name, price, and category are required fields.",
    });
  }
  next();
};

app.use(logger);

// Middleware setup
app.use(bodyParser.json());

// Sample in-memory products database
let products = [
  {
    id: "1",
    name: "Laptop",
    description: "High-performance laptop with 16GB RAM",
    price: 1200,
    category: "electronics",
    inStock: true,
  },
  {
    id: "2",
    name: "Smartphone",
    description: "Latest model with 128GB storage",
    price: 800,
    category: "electronics",
    inStock: true,
  },
  {
    id: "3",
    name: "Coffee Maker",
    description: "Programmable coffee maker with timer",
    price: 50,
    category: "kitchen",
    inStock: false,
  },
];

// Root route
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Product API! Go to /api/products to see all products."
  );
});

// GET /api/products - Get all products
// Example route implementation for GET /api/products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product
app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  // Find the product in our array
  const product = products.find((p) => p.id === id);
  // If not found, send a 404 error
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

// POST /api/products - Create a new product
app.post("/api/products", authenticate, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  // Basic validation (check if required fields exist)
  if (!name || !price || !category) {
    return res
      .status(400)
      .json({ message: "Name, price, and category are required." });
  }

  // create a new productF
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock: inStock ?? true, // if inStock is missing, default to true
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product
app.put("/api/products/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, inStock } = req.body;

  // Find the product by ID
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found. " });
  }

  // Update the product fields (only if new values are provided)
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (category !== undefined) product.category = category;
  if (inStock !== undefined) product.inStock = inStock;

  res.json({ message: "Product updated successfully.", product });
});

// DELETE /api/products/:id - Delete a product
app.delete("/api/products/:id", authenticate, (req, res) => {
  const { id } = req.params;

  // Find the index of the product with that ID
  const productIndex = products.findIndex((p) => p.id === id);

  //if not found return error
  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found." });
  }

  // remove the product from the array
  const deletedProduct = products.splice(productIndex, 1);

  res.json({
    message: "Product deleted successfully.",
    product: deletedProduct[0],
  });
});

// TODO: Implement custom middleware for:
// - Error handling

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;
