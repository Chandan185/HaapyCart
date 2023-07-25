const app = require("./app");
const dotenv = require("dotenv");
const connectdatabase = require("./config/database");

//Handling uncaught exceptions
//this code should be on the top
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server due to unhandled uncaught exception");
  process.exit(1);
});

//setting up config file
dotenv.config({ path: "backend/config/config.env" });

//connection to database
connectdatabase();
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
