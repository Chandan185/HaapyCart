const mongoose = require("mongoose");
const connectdatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(
        `Mongodb database connected with host: ${con.connection.host}`
      );
    });
};

module.exports = connectdatabase;
