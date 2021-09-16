const { RepeatMode } = require("discord-music-player");

const musicCommands = async (player, message, command, args) => {
  let guildQueue = player.getQueue(message.guild.id);

  switch (command) {
    case "play":
    case "p":
      {
        let queue = player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        queue
          .play(args.join(" "))
          .then((song) => {
            message.channel.send(`${song.name} was added to the queue.`);
          })
          .catch((_) => {
            if (!guildQueue) queue.stop();
          });
      }
      break;
    case "playlist":
      {
        let queue = player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        queue
          .playlist(args.join(" "))
          .then((song) => {
            message.channel.send(`${song.name} was added to the queue.`);
          })
          .catch((_) => {
            if (!guildQueue) queue.stop();
          });
      }
      break;
    case "skip":
      guildQueue.skip();
      break;
    case "stop":
      guildQueue.stop();
      break;
    case "noloop":
      guildQueue.setRepeatMode(RepeatMode.DISABLED); // or 0 instead of RepeatMode.DISABLED
      break;
    case "loop":
      guildQueue.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
      break;
    case "loopQueue":
    case "loopqueue":
      guildQueue.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
      break;
    case "setVolume":
      guildQueue.setVolume(parseInt(args[0]));
      break;
    case "seek":
      guildQueue.seek(parseInt(args[0]) * 1000);
      break;
    case "clearQueue":
      guildQueue.clearQueue();
      break;
    case "shuffle":
      guildQueue.shuffle();
      break;
    case "getQueue":
    case "queue":
    case "q":
      console.log(guildQueue.songs);
      break;
    case "getVolume":
      console.log(guildQueue.volume);
      break;
    case "nowPlaying":
    case "nowplaying":
      console.log(`Now playing: ${guildQueue.nowPlaying}`);
      break;
    case "pause":
      guildQueue.setPaused(true);
      break;
    case "resume":
      guildQueue.setPaused(false);
      break;
    case "remove":
      guildQueue.remove(parseInt(args[0]));
      break;
    case "createProgressBar":
    case "createprogressbar":
      const ProgressBar = guildQueue.createProgressBar();

      // [======>              ][00:35/2:20]
      console.log(ProgressBar.prettier);
      break;
    default:
      message.channel.send("I do not know that command.");
      break;
  }
};

module.exports = musicCommands;
