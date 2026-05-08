const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    offer: {
      type: String,
      default: "",
    },

    publisher: {
      type: String,
      trim: true,
    },

    isbn: {
      type: String,
      trim: true,
    },

    publicationDate: {
      type: String,
      trim: true,
    },

    language: {
      type: String,
      trim: true,
    },

    // ✅ MULTIPLE CATEGORIES
    categories: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Draft", "Archived", "Pending Approval"],
      default: "Active",
    },

    stock: {
      type: Number,
      default: 0,
    },

    pageCount: {
      type: Number,
      default: 0,
    },

    dimensions: {
      type: String,
      trim: true,
    },

    coverType: {
      type: String,
      trim: true,
    },

    coverImage: {
      type: String, // Cloudinary URL
    },

    bookPdf: {
      type: String, // Cloudinary URL
    },

    // =====================
    // OWNERSHIP & CONTROL
    // =====================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: function () {
        return this.createdByModel === "Seller";
      },
    },

    createdByModel: {
      type: String,
      enum: ["Admin", "Seller"],
      default: "Admin",
      required: true,
    },

    blocked: {
      type: Boolean,
      default: false,
    },

    cartCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);
