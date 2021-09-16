require("dotenv").config();

const Discord = require("discord.js");
const intents = new Discord.Intents(32767);
const client = new Discord.Client({ intents });

const PREFIX = "!";

client.on("ready", () => {
  console.log(`${client.user.tag} is ready!`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  let [command, ...args] = message.content
    .trim()
    .substring(PREFIX.length)
    .split(/\s+/);

  command = command.toLowerCase();

  console.log(command);
  console.log(args);

  switch (command) {
    case "hello":
      message.channel.send("Hello!");
      break;
    default:
      unknown(message);
      break;
  }
});

client.login(process.env.BOT_TOKEN);
