const { MessageEmbed } = require("discord.js");

const generalCommands = (message, command, args) => {
  switch (command) {
    case "hello":
      message.channel.send("Hello!");
      break;
    case "commands":
      const embedMessage = new MessageEmbed().setColor("#ffffff").addFields(
        { name: "General", value: "hello\ncommands\nclear" },
        {
          name: "music",
          value:
            "play\nplayBatch\nplaylist\nskip\nstop\nloop\nloopQueue\nnoLoop\nqueue\nclearQueue\npause\nresume\nremove\nnowPlaying\nsetVolume\ncreateProgressBar\nsave\nload",
        }
      );
      message.channel.send({ embeds: [embedMessage] });
      break;
    case "clear":
      let amount = args[0];
      if (!amount) amount = 1;
      if (parseInt(amount) + 1 > 100) {
        message.channel.send("Amount to clear has to be less than 100.");
      } else {
        message.channel
          .bulkDelete(parseInt(amount) + 1)
          .then((messages) =>
            console.log(`Bulk deleted ${messages.size} messages`)
          )
          .catch(console.error);
      }
      break;
  }
};

module.exports = generalCommands;
