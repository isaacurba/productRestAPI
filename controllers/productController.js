const { v4: uuidv4 } = require("uuid");
let products = require("../data/products.js");
const { NotFoundError } = require("../utils/error.js");

// GET all products (filter + pagination)
const getAllProducts = (req, res, next) => {
  try {
    const { category, page = 1, limit = 5 } = req.query;
    let results = products;

    if (category) {
      results = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(results.length / limit),
      totalProducts: results.length,
      products: paginatedResults,
    });
  } catch (error) {
    next(error);
  }
};

// SEARCH
const searchProducts = (req, res) => {
  const { name } = req.query;
  if (!name)
    return res.status(400).json({ message: "Pls provide a name to search" });

  const results = products.filter((p) =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );

  if (results.length === 0)
    return res.status(404).json({ message: "No products found." });

  res.json({ results });
};

// STATS
const getProductStats = (req, res) => {
  const stats = {};
  products.forEach((p) => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json({
    totalProducts: products.length,
    countByCategory: stats,
  });
};

// GET BY ID
const getProductById = (req, res, next) => {
  try {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) throw new NotFoundError("Product not found");
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// CREATE
const createProduct = (req, res, next) => {
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
};

// UPDATE
const updateProduct = (req, res, next) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const { name, description, price, category, inStock } = req.body;
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (inStock !== undefined) product.inStock = inStock;

  res.json({ message: "Product updated successfully", product });
};

// DELETE
const deleteProduct = (req, res, next) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1)
    return res.status(404).json({ message: "Product not found" });
  const deleted = products.splice(index, 1);
  res.json({ message: "Product deleted successfully", deleted });
};

// ✅ EXPORT all
module.exports = {
  getAllProducts,
  searchProducts,
  getProductStats,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
