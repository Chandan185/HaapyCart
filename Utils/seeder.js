const products = require("../data/products");
const Product = require("../models/product");
const connectdatabase = require("../config/database");
const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });
connectdatabase();
const seedProducts = async (req, res, next) => {
  try {
    await Product.deleteMany();
    console.log("Products are deleted");

    await Product.insertMany(products);
    console.log("All are inserted");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

seedProducts();
