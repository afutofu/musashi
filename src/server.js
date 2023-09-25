require("dotenv").config();

const client = require("./bot");
const mongoose = require("mongoose");

// CONNECT TO DB
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB!");

    // INITIALIZE BOT
    client.login(process.env.BOT_TOKEN);
  })
  .catch((err) => {
    console.log("Failed to connect to DB");
    console.log(err);
  });
