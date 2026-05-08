const Product = require('../models/product');
const cloudinary = require('../config/cloudinary');


exports.addProduct = async (req, res) => {
  try {
    const {
      id,
      title,
      price,
      stock,
      status,
      description,
      author,
      categories,
      publisher,
      isbn,
      publicationDate,
      language,
      pageCount,
      dimensions,
      coverType
    } = req.body;

        let coverImageUrl = "";
    let bookPdfUrl = "";

    if (req.body.imageUrl) coverImageUrl = req.body.imageUrl;
    if (req.body.pdfUrl) bookPdfUrl = req.body.pdfUrl;


    // Basic validation
    if (!title || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: 'Title, price, and stock are required.',
      });
    }

    if (!id || !title || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "ID, title, price, and stock are required.",
      });
    }

    // Create new product (ADMIN)
    const newProduct = new Product({
      id,
      title,
      price,
      stock,
      status,
      description,
      author,
      categories: Array.isArray(req.body.categories)
  ? req.body.categories
  : [req.body.category].filter(Boolean),


      publisher,
      isbn,
      publicationDate,
      language,
      pageCount,
      dimensions,
      coverType,

       coverImage: coverImageUrl,
      bookPdf: bookPdfUrl,


      createdByModel: 'Admin', // optional but clear
    });

    await newProduct.save();

    res.status(201).json({
      message: '✅ Product added successfully',
      product: newProduct,
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({
      message: '❌ Server error while adding product',
    });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({
      blocked: false,
      status: { $in: ['Active', 'Pending Approval'] },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: products.length,
      products,
    });
  } catch (err) {
    console.error('Error fetching public products:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================
// USER → GET BESTSELLERS
// ============================
exports.getBestsellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const products = await Product.find({
      blocked: false,
      status: { $in: ["Active", "Pending Approval"] },
    })
      .sort({ cartCount: -1 })
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: products.length,
      products,
    });
  } catch (err) {
    console.error("Error fetching bestsellers:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ============================
// ADMIN → UPDATE PRODUCT
// ============================
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// ADMIN → DELETE PRODUCT
// ============================
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// ============================
// ADMIN → GET SINGLE PRODUCT
// ============================
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,   // ✅ ALWAYS wrap in product
    });
  } catch (err) {
    console.error("Fetch single product error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


