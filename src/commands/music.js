const { RepeatMode } = require("discord-music-player");
const { MessageEmbed } = require("discord.js");

const musicCommands = async (player, message, command, args) => {
  let guildQueue = await player.getQueue(message.guild.id);

  // Check if user who messaged is in a voice channel
  if (!message.member.voice.channel) {
    message.channel.send("You need to be in a voice channel first!");
    return;
  }

  // Check if there is a queue when a command is issued
  const lowercaseCommand = command.toLowerCase();
  if (
    !guildQueue &&
    lowercaseCommand != "play" &&
    lowercaseCommand != "p" &&
    lowercaseCommand != "playbatch" &&
    lowercaseCommand != "pb" &&
    lowercaseCommand != "playlist"
  ) {
    message.channel.send("There is no queue!");
    return;
  }

  const play = async (player, message, args) => {
    let queue = player.createQueue(message.guild.id);
    await queue.join(message.member.voice.channel);
    queue
      .play(args.join(" "))
      .then((song) => {
        const embedMessage = new MessageEmbed()
          .setColor("#ffffff")
          .setTitle(`${song.name}`)
          .setURL(song.url)
          .setAuthor("Added to queue")
          .setThumbnail(song.thumbnail)
          .addFields(
            { name: "Channel", value: `${song.author}`, inline: true },
            {
              name: "Song Duration",
              value: `${song.duration}`,
              inline: true,
            },
            {
              name: "Queue Index",
              value: `${queue.songs.length - 1}`,
              inline: true,
            }
          );
        message.channel.send({ embeds: [embedMessage] });
      })
      .catch((_) => {
        if (!guildQueue) queue.stop();
      });
  };

  switch (command) {
    case "play":
    case "p":
      play(player, message, args);
      break;
    case "playBatch":
    case "playbatch":
    case "pb":
      {
        const fullArg = args.join(" ");
        const separatedSongs = fullArg.split("|");

        for (songStr of separatedSongs) {
          const songArgs = songStr.trim().split(" ");
          play(player, message, songArgs);
        }
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
      message.channel.send(
        `:fast_forward: Skipped ${guildQueue.nowPlaying.name}`
      );
      break;
    case "stop":
      guildQueue.stop();
      message.channel.send("Bye!");
      break;
    case "noloop":
      guildQueue.setRepeatMode(RepeatMode.DISABLED); // or 0 instead of RepeatMode.DISABLED
      message.channel.send("Loop disabled!");
      break;
    case "loop":
      if (guildQueue.songs.length <= 0) {
        message.channel.send("No songs in queue!");
        return;
      }
      guildQueue.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
      message.channel.send(
        `:repeat_one: Now looping ${guildQueue.nowPlaying.name}`
      );
      break;
    case "loopQueue":
    case "loopqueue":
      guildQueue.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
      message.channel.send(`:repeat: Now looping queue`);
      break;
    case "setVolume":
      guildQueue.setVolume(parseInt(args[0]));
      break;
    case "seek":
      guildQueue.seek(parseInt(args[0]) * 1000);
      break;
    case "clearQueue":
    case "clearqueue":
      guildQueue.clearQueue();
      message.channel.send("Cleared queue");
      break;
    case "shuffle":
      guildQueue.shuffle();
      message.channel.send(`:twisted_rightwards_arrows: Shuffled queue`);
      break;
    case "getQueue":
    case "queue":
    case "q":
      const embedMessage = new MessageEmbed()
        .setColor("#ffffff")
        .setTitle("Queue")
        .setDescription(`Now Playing\n${guildQueue.nowPlaying}`)
        .setThumbnail(guildQueue.nowPlaying.thumbnail);

      guildQueue.songs.forEach((song, i) => {
        embedMessage.addField(`${i} - ${song.name}`, `${song.url}`, true);
        embedMessage.addField(`Duration`, `${song.duration}`, true);
        embedMessage.addField("\u200B", "\u200B", true);
      });

      message.channel.send({ embeds: [embedMessage] });
      break;
    case "getVolume":
      console.log(guildQueue.volume);
      break;
    case "nowPlaying":
    case "nowplaying":
      console.log(`Now playing: ${guildQueue.nowPlaying}`);
      message.channel.send(`Now playing: ${guildQueue.nowPlaying}`);
      break;
    case "pause":
      guildQueue.setPaused(true);
      message.channel.send(":play_pause: Paused");
      break;
    case "resume":
      guildQueue.setPaused(false);
      message.channel.send(":play_pause: Resumed");
      break;
    case "remove":
      const songName = guildQueue.songs[0].name;
      guildQueue.remove(parseInt(args[0]));
      message.channel.send(`Removed ${songName}`);
      break;
    case "createProgressBar":
    case "createprogressbar":
      const ProgressBar = guildQueue.createProgressBar();

      // [======>              ][00:35/2:20]
      console.log(ProgressBar.prettier);
      break;
    case "save":
      const songs = guildQueue.songs;
      const userId = message.author.id;
      let songsString = songs[0].url;

      // Get songString to be saved to DB
      // Ex - [url1] | [url2] | [url3]
      if (songs.length > 1) {
        for (song of songs) {
          songsString += " | " + song.url;
        }
      }
      console.log("Save queue with id");
      console.log(songsString, userId);
      break;
  }
};

module.exports = musicCommands;
