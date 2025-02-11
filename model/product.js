const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  url: String,
  rating: Number,
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
