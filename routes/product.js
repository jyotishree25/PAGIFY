// routes/product.js
const express = require("express");
const {
  addProduct,
  getProducts,
  getPublicProducts,
  getBestsellers,
  updateProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/productController");

const router = express.Router();

// ADMIN
router.post("/add", addProduct);
router.get("/all", getProducts);
router.put("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

// USER
router.get("/public", getPublicProducts);
router.get("/bestsellers/list", getBestsellers);
router.get("/:productId", getProductById);

module.exports = router;
