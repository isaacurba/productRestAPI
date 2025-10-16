// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

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

// TODO: Implement the following routes:
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product

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

app.get("/api/products", (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  // Basic validation (check if required fields exist)
  if (!name || !price || !category) {
    return res
      .status(400)
      .json({ message: "Name, price, and category are required." });
  }

  // create a new product
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

// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;
