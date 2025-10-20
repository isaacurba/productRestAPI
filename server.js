// server.js - Week 2 Assignment

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
    description: "High-performance laptop",
    price: 1200,
    category: "electronics",
    inStock: true,
  },
  {
    id: "2",
    name: "Smartphone",
    description: "Latest model",
    price: 800,
    category: "electronics",
    inStock: true,
  },
  {
    id: "3",
    name: "Coffee Maker",
    description: "Programmable maker",
    price: 50,
    category: "kitchen",
    inStock: false,
  },
];

// 🧩 Custom Middleware

// Logger middleware
function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}
app.use(logger);

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
}

// Validation middleware
function validateProduct(req, res, next) {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    return res
      .status(400)
      .json({ message: "Name, price, and category are required fields." });
  }
  next();
}

// Root route
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Product API! Go to /api/products to see all products."
  );
});

// GET all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// GET one product
app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST create a product (with authentication + validation)
app.post("/api/products", authenticate, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock: inStock ?? true,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT update a product (with authentication + validation)
app.put("/api/products/:id", authenticate, validateProduct, (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const { name, description, price, category, inStock } = req.body;
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (inStock !== undefined) product.inStock = inStock;

  res.json({ message: "Product updated successfully", product });
});

// DELETE a product (only authentication, no need for validation)
app.delete("/api/products/:id", authenticate, (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1)
    return res.status(404).json({ message: "Product not found" });
  const deleted = products.splice(index, 1);
  res.json({ message: "Product deleted successfully", deleted });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
