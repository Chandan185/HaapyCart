const express = require("express");
const errorMiddleware = require("./middlewares/errors");
const CookieParser = require("cookie-parser");
const bodyparser = require("body-parser");
const fileupload = require("express-fileupload");
const dotenv = require("dotenv");
const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(bodyparser.urlencoded({ limit: "100mb", extended: true }));
app.use(CookieParser());
app.use(fileupload());
//setting up config file
dotenv.config({ path: "./config/config.env" });
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",'http://localhost:3000');
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'"
  );
  next();
});

const product = require("./routes/products");
const user = require("./routes/users");
const order = require("./routes/orders");
const payment = require("./routes/Payment");
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", order);
app.use(errorMiddleware);
module.exports = app;
