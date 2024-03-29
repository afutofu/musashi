const { RepeatMode } = require("discord-music-player");
const { MessageEmbed } = require("discord.js");

const Queue = require("../models/Queue");

const musicCommands = async (player, message, command, args) => {
  let guildQueue = await player.getQueue(message.guild.id);

  // Check if user who messaged is in a voice channel
  if (!message.member.voice.channel) {
    message.channel.send("You need to be in a voice channel first!");
    return;
  }

  // Check if there is a queue when certain commands are issued
  if (
    !guildQueue &&
    command != "play" &&
    command != "p" &&
    command != "playbatch" &&
    command != "pb" &&
    command != "playlist" &&
    command != "load"
  ) {
    message.channel.send("There is no queue!");
    return;
  }

  const play = async (player, message, args, noFeedback) => {
    let queue = player.createQueue(message.guild.id);
    await queue.join(message.member.voice.channel);
    queue
      .play(args.join(" "))
      .then((song) => {
        if (noFeedback) return;
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

  const loadQueue = async (foundQueue) =>
    new Promise(async (resolve, reject) => {
      console.log("loadQueue");
      try {
        for (const songName of foundQueue.songs) {
          // Turns "Song Name" to ["Song", "Name"]
          const songArgs = songName.trim().split(" ");
          await play(player, message, songArgs, true);
          console.log("post play");
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });

  switch (command) {
    case "play":
    case "p":
      play(player, message, args);
      break;
    case "playbatch":
    case "pb":
      {
        const fullArg = args.join(" ");
        const separatedSongs = fullArg.split("|");

        for (songStr of separatedSongs) {
          const songArgs = songStr.trim().split(" ");
          await play(player, message, songArgs);
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
            message.channel.send(`**${song.name}** was added to the queue.`);
          })
          .catch((_) => {
            if (!guildQueue) queue.stop();
          });
      }
      break;
    case "skip":
      guildQueue.skip();
      message.channel.send(
        `:fast_forward: Skipped **${guildQueue.nowPlaying.name}**`
      );
      break;
    case "leave":
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
        `:repeat_one: Now looping **${guildQueue.nowPlaying.name}**`
      );
      break;
    case "loopqueue":
      guildQueue.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
      message.channel.send(`:repeat: Now looping queue`);
      break;
    case "setvolume":
      guildQueue.setVolume(parseInt(args[0]));
      break;
    case "seek":
      guildQueue.seek(parseInt(args[0]) * 1000);
      break;
    case "clearqueue":
      guildQueue.clearQueue();
      message.channel.send("Cleared queue");
      break;
    case "shuffle":
      guildQueue.shuffle();
      message.channel.send(`:twisted_rightwards_arrows: Shuffled queue`);
      break;
    case "getqueue":
    case "queue":
    case "q":
      let embedMessage;
      if (guildQueue.nowPlaying != undefined) {
        embedMessage = new MessageEmbed()
          .setColor("#ffffff")
          .setTitle("Queue")
          .setDescription(`Now Playing\n${guildQueue.nowPlaying}`)
          .setThumbnail(guildQueue.nowPlaying.thumbnail);
      } else {
        embedMessage = new MessageEmbed()
          .setColor("#ffffff")
          .setTitle("Queue")
          .setDescription(
            `No song currently playing. Play a song or wait for a song to load.`
          );
      }

      guildQueue.songs.forEach((song, i) => {
        embedMessage.addField(`${i} - ${song.name}`, `${song.url}`, true);
        embedMessage.addField(`Duration`, `${song.duration}`, true);
        embedMessage.addField("\u200B", "\u200B", true);
      });

      message.channel.send({ embeds: [embedMessage] });
      break;
    case "getvolume":
      console.log(guildQueue.volume);
      break;
    case "nowplaying":
      if (guildQueue.nowPlaying != undefined) {
        console.log(`Now playing: ${guildQueue.nowPlaying}`);
        message.channel.send(`Now playing **${guildQueue.nowPlaying}**`);
      } else {
        message.channel.send(`No song currently playing.`);
      }
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
      const songName = guildQueue.songs[parseInt(args[0])].name;
      guildQueue.remove(parseInt(args[0]));
      message.channel.send(`Removed **${songName}**`);
      break;
    case "createprogressbar":
      const ProgressBar = guildQueue.createProgressBar();

      // [======>              ][00:35/2:20]
      console.log(ProgressBar.prettier);
      break;
    case "save":
      {
        const queueSongs = guildQueue.songs;
        const userId = message.author.id;
        let songs = [];

        for (const song of queueSongs) {
          // Add song name and channel name
          songs.push(song.name + " " + song.author);
        }

        // Save queue string and user id to database as new queue object
        Queue.findOneAndUpdate({ userId }, { songs }, (err, foundQueue) => {
          if (err) {
            console.log(err);
            message.channel.send("Error saving queue");
            return;
          }

          // If there is no queue associated with user, create a new queue record in DB
          if (!foundQueue) {
            const queue = new Queue({
              userId,
              songs,
            });

            queue
              .save()
              .then(() => {
                message.channel.send(
                  "Successfully saved queue with your account"
                );
              })
              .catch((err) => {
                console.log(err);
                message.channel.send("Error in saving queue");
              });
            return;
          }

          message.channel.send("Successfully updated queue with your account");
        });
      }
      break;
    case "load":
      {
        // Fetch queue from DB
        const userId = message.author.id;
        Queue.findOne({ userId }, async (err, foundQueue) => {
          if (err) {
            console.log(err);
            message.channel.send("Error loading queue");
            return;
          }

          // If there is no queue associated with user
          if (!foundQueue) {
            message.channel.send("No queue saved with this user");
            return;
          }

          message.channel.send(
            "Loading saved songs into queue. Please wait a few seconds.."
          );

          await loadQueue(foundQueue)
            .then(() => {
              message.channel.send("Successfully loaded queue.");
            })
            .catch((e) => {
              console.log(e);
              message.channel.send("Failed to load queue.");
            });
        });
      }
      break;
  }
};

module.exports = musicCommands;
