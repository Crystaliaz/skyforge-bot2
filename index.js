const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Keep-alive server for Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Skyforge bot is running!'));
app.listen(process.env.PORT || 3000);

// Fake bot object to simulate activity
let bot = {
  connected: false,
  connect: function() {
    console.log("Bot connecting...");
    this.connected = true;

    // Anti-AFK: small movements every 30s
    if (cfg.utils["anti-afk"].enabled) {
      setInterval(() => {
        console.log("Bot is moving slightly to prevent AFK kick...");
        // Replace this with your bot framework's movement/jump/sneak function
        // Example:
        // yourBot.moveForward(1)
        // yourBot.jump()
      }, 30000);
    }

    // Repeating chat messages
    if (cfg.utils["chat-messages"].enabled && cfg.utils["chat-messages"].repeat) {
      let msgs = cfg.utils["chat-messages"].messages;
      let delay = cfg.utils["chat-messages"]["repeat-delay"] * 1000;
      let index = 0;
      setInterval(() => {
        console.log("Chat message:", msgs[index % msgs.length]);
        // Replace with your bot framework's chat function
        // Example:
        // yourBot.chat(msgs[index % msgs.length])
        index++;
      }, delay);
    }
  },
  disconnect: function() {
    console.log("Bot disconnected. Reconnecting...");
    this.connected = false;
    setTimeout(() => this.connect(), cfg.utils["auto-reconnect-delay"]);
  }
};

// Start the bot
bot.connect();
