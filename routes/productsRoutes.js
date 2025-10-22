// routes/productRoutes.js

const express = require("express");
const router = express.Router();

// Import controller and middleware
const productController = require("../controllers/productController");
const authenticate = require("../middleware/authenticate");
const validateProduct = require("../middleware/validateProduct");

// All product routes

// 🟢 Get all products (with filter + pagination)
router.get("/", productController.getAllProducts);

// 🔍 Search products by name
router.get("/search", productController.searchProducts);

// 📊 Get product statistics (count by category)
router.get("/stats", productController.getProductStats);

// 🔵 Get one product by ID
router.get("/:id", productController.getProductById);

// 🟡 Create a new product (protected + validated)
router.post("/", authenticate, validateProduct, productController.createProduct);

// 🟠 Update a product (protected + validated)
router.put("/:id", authenticate, validateProduct, productController.updateProduct);

// 🔴 Delete a product (protected)
router.delete("/:id", authenticate, productController.deleteProduct);

// Export the router so server.js can use it
module.exports = router;
