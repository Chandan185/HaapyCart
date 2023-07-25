const app = require("./app");
const dotenv = require("dotenv");
const connectdatabase = require("./config/database");
const cloudinary=require('cloudinary');

//Handling uncaught exceptions
//this code should be on the top
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server due to unhandled uncaught exception");
  process.exit(1);
});

//setting up config file
dotenv.config({ path: "./config/config.env" });

//connection to database
connectdatabase();

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`
})


const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

//Handling unhandled promise rejections

process.on("unhandledRejection", (error) => {
  console.log(`Error: ${error.stack}`);
  console.log("Shutting down server due unhandled promise rejection");
  process.exit(1);
});
