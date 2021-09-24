require("dotenv").config();

const client = require("./bot");
const mongoose = require("mongoose");

// CONNECT TO DB
mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => console.log("Connected to DB!")
);

// INITIALIZE BOT
client.login(process.env.BOT_TOKEN);
