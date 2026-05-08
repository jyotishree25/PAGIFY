const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");

/* SAME CATEGORY SET AS ADMIN (UNION) */
const ALLOWED_CATEGORIES = [
  "Horror",
  "Romance",
  "Mystery Thriller",
  "Science",
  "Fiction",
  "Non Fiction",
  "Autobiography",
  "Biography",
  "Business & Economy",
  "Self Help",
  "Study Materials",
  "Current Affairs & Politics",
  "Travel",
  "Art & Photography",
  "Bengali",
  "Children's Book",
  "Cooking",
  "Manga",
  "Poetry",
  "Religion & Spirituality",
  "History",
];

/**
 * =====================
 * SELLER → ADD PRODUCT
 * (IDENTICAL TO ADMIN)
 * =====================
 */
exports.sellerAddProduct = async (req, res) => {
  try {
    /* DEBUG */
    console.log("REQ BODY:", req.body);

    const {
      id,
      title,
      author,
      description,
      price,
      offer,
      language,
      publisher,
      publishDate,
      isbn,
      pages,
      stock,
    } = req.body;

    /* ✅ VALIDATION (SAME AS ADMIN) */
    if (!id || !title || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "SKU, Title, Price and Stock are required",
      });
    }

    /* ================= CATEGORIES ================= */
    let categories = [];
    const incomingCategories =
      req.body.categories || req.body["categories[]"];

    if (incomingCategories) {
      categories = Array.isArray(incomingCategories)
        ? incomingCategories
        : [incomingCategories];

      categories = categories.filter((cat) =>
        ALLOWED_CATEGORIES.includes(cat)
      );
    }

    console.log("FINAL CATEGORIES:", categories);

    /* ================= FILE UPLOAD ================= */
    let coverImageUrl = "";
    let bookPdfUrl = "";

    if (req.files?.coverImage) {
      const result = await cloudinary.uploader.upload(
        `data:${req.files.coverImage[0].mimetype};base64,${req.files.coverImage[0].buffer.toString("base64")}`,
        { folder: "pagify/books" }
      );
      coverImageUrl = result.secure_url;
    }

    if (req.files?.bookPdf) {
      const result = await cloudinary.uploader.upload(
        `data:${req.files.bookPdf[0].mimetype};base64,${req.files.bookPdf[0].buffer.toString("base64")}`,
        {
          folder: "pagify/pdfs",
          resource_type: "raw",
        }
      );
      bookPdfUrl = result.secure_url;
    }

    /* ================= CREATE PRODUCT ================= */
    const product = await Product.create({
      /* SAME FIELDS AS ADMIN */
      id,
      title,
      author,
      description,
      price: Number(price),
      stock: Number(stock),
      offer: offer || "",
      language,
      categories,
      publisher,
      publicationDate: publishDate,
      isbn,
      pageCount: pages ? Number(pages) : 0,

      coverImage: coverImageUrl,
      bookPdf: bookPdfUrl,

      /* ONLY DIFFERENCE */
      status: "Active",
      createdBy: req.user.id,
      createdByModel: "Seller",
    });

    res.status(201).json({
  message: "Book added and approved successfully",
  product,
});

  } catch (err) {
    console.error("Error adding seller product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * SELLER → GET OWN PRODUCTS
 * =====================
 */
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({
      createdBy: req.user.id,
      createdByModel: "Seller",
    }).sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    console.error("Fetch seller products error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * SELLER → UPDATE PRODUCT
 * =====================
 */
exports.updateSellerProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      createdBy: req.user.id,
      createdByModel: "Seller",
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });

    if (req.files?.coverImage) {
      const result = await cloudinary.uploader.upload(
        `data:${req.files.coverImage[0].mimetype};base64,${req.files.coverImage[0].buffer.toString("base64")}`,
        { folder: "pagify/books" }
      );
      product.coverImage = result.secure_url;
    }

    if (req.files?.bookPdf) {
      const result = await cloudinary.uploader.upload(
        `data:${req.files.bookPdf[0].mimetype};base64,${req.files.bookPdf[0].buffer.toString("base64")}`,
        {
          folder: "pagify/pdfs",
          resource_type: "raw",
        }
      );
      product.bookPdf = result.secure_url;
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("Seller update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * SELLER → DELETE PRODUCT
 * =====================
 */
exports.deleteSellerProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await Product.findOneAndDelete({
      _id: productId,
      createdBy: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted permanently" });
  } catch (err) {
    console.error("Seller delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
