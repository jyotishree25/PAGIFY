const express = require("express");
const {
  sellerAddProduct,
  getSellerProducts,
  updateSellerProduct,
  deleteSellerProduct,
} = require("../controllers/sellerProductController");

const sellerAuth = require("../middleware/sellerAuth");
const upload = require("../middleware/upload");

const router = express.Router();

/**
 * =========================
 * SELLER → ADD PRODUCT
 * =========================
 */
router.post(
  "/add",
  sellerAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "bookPdf", maxCount: 1 },
  ]),
  sellerAddProduct
);

/**
 * =========================
 * SELLER → GET OWN PRODUCTS
 * =========================
 */
router.get(
  "/my-products",
  sellerAuth,
  getSellerProducts
);

/**
 * =========================
 * SELLER → UPDATE PRODUCT
 * =========================
 */
router.put(
  "/:productId",
  sellerAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "bookPdf", maxCount: 1 },
  ]),
  updateSellerProduct
);


/**
 * =========================
 * SELLER → DELETE PRODUCT
 * =========================
 */
router.delete(
  "/:productId",
  sellerAuth,
  deleteSellerProduct
);

module.exports = router;
