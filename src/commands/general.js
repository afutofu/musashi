const { MessageEmbed } = require("discord.js");

const generalCommands = (message, command, args) => {
  switch (command) {
    case "hello":
      message.channel.send("Hello!");
      break;
    case "commands":
      console.log("test");
      const embedMessage = new MessageEmbed().setColor("#ffffff").addFields(
        { name: "General", value: "hello\ncommands" },
        {
          name: "music",
          value:
            "play\nplaylist\nskip\nstop\nloop\n    loopQueue\nnoLoop\nqueue\n       clearQueue\npause\nresume\nremove\nnowPlaying\nsetVolume\ncreateProgressBar",
        }
      );
      message.channel.send({ embeds: [embedMessage] });
      break;
    default:
      message.channel.send("I do not know that command.");
      break;
  }
};

module.exports = generalCommands;
