// server.js - Week 2 Assignment

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { parse } = require("dotenv");

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

// Custom Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
    this.statusCode = 401;
  }
}

// Root route
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Product API! Go to /api/products to see all products."
  );
});

// GET all products

// category filter AND pagination
app.get("/api/products", (req, res) => {
  const { category, page = 1, limit = 5 } = req.query;
  let results = products;

  // if category query is present
  if (category) {
    results = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  // pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedResults = results.slice(startIndex, endIndex);

  res.json({
    currentPage: parseInt(page),
    totalPages: Math.ceil(results.length / limit),
    totalProducts: results.length,
    products: paginatedResults,
  });
});

// search products by name
app.get("/api/products/search", (req, res) => {
  const { name } = req.query;
  if (!name)
    return res.status(400).json({ message: "Pls provide a name to search" });

  // case sensitive search
  const results = products.filter((p) =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
  if (results.length === 0)
    return res.status(404).json({ message: "No products found." });
  res.json({ results });
});

// products stats
app.get("/api/products/stats", (req, res) => {
  const stats = {};

  products.forEach((p) => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json({
    totalProducts: products.length,
    countByCategory: stats,
  });
});

// GET one product
app.get("/api/products/:id", (req, res, next) => {
  try {
    const product = products.find((p) => p.id === req.params.id);
    // logic before custom error handler
    // if (!product) return res.status(404).json({ message: "Product not found" });
    if (!product) throw new NotFoundError("Product not found");
    res.json(product);
  } catch (err) {
    next(err);
  }
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

//Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      name: err.name || "server error",
      message,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
