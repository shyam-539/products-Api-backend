const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const Product = require("./model/product");

app.use(express.json());

// ✅ CORS FIX: Allow only your frontend & local development
const allowedOrigins = [
  "https://products-api-frontend.onrender.com", // Your frontend on Render
  "http://localhost:5173" // Local development (Vite)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS BLOCKED: ${origin}`); // Logs blocked origins
      callback(new Error("CORS Policy Error: Not allowed by server"));
    }
  }
}));

// ✅ MongoDB Connection Handling
const url = process.env.MONGODB_URL;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to the E-Commerce API!");
});

// ✅ Get All Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// ✅ Create a New Product
app.post("/products", async (req, res) => {
  try {
    const { name, price, description, url, rating } = req.body;
    const newProduct = new Product({ name, price, description, url, rating });
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(400).json({ message: "Error adding product", error });
  }
});

// ✅ Update a Product
app.patch("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: "Error updating product", error });
  }
});

// ✅ Delete a Product
app.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(400).json({ message: "Error deleting product", error });
  }
});

// ✅ Get Count of Products Above a Certain Price
app.get("/products/count/:price", async (req, res) => {
  try {
    const price = Number(req.params.price);
    const productCount = await Product.aggregate([
      { $match: { price: { $gt: price } } },
      { $count: "productCount" },
    ]);
    res.status(200).json(productCount);
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(400).json({ message: "Error fetching product count", error });
  }
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
