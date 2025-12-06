const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');

// Load config
const cfg = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Keep-alive webserver (Render needs this)
const app = express();
app.get('/', (req, res) => res.send('Skyforge bot is running!'));
app.listen(process.env.PORT || 3000);

function startBot() {
  console.log("Starting bot...");

  const bot = mineflayer.createBot({
    host: cfg.server.ip,
    port: cfg.server.port,
    version: cfg.server.version,
    username: cfg["bot-account"].username,
    auth: "offline"
  });

  bot.once("spawn", () => {
    console.log("Bot connected to server.");

    // Anti-AFK
    if (cfg.utils["anti-afk"].enabled) {
      setInterval(() => {
        try {
          bot.setControlState("sneak", cfg.utils["anti-afk"].sneak);
        } catch (e) {}
      }, 5000);
    }

    // Repeating chat messages
    if (cfg.utils["chat-messages"].enabled &&
        cfg.utils["chat-messages"].repeat) {

      let msgs = cfg.utils["chat-messages"].messages;
      let delay = cfg.utils["chat-messages"]["repeat-delay"] * 1000;
      let index = 0;

      setInterval(() => {
        bot.chat(msgs[index % msgs.length]);
        index++;
      }, delay);
    }
  });

  // Log chat
  bot.on("message", (msg) => {
    if (cfg.utils["chat-log"]) {
      console.log("[CHAT] " + msg.toString());
    }
  });

  // Auto reconnect
  bot.on("end", () => {
    console.log("Bot disconnected. Reconnecting...");
    setTimeout(startBot, cfg.utils["auto-recconect-delay"]);
  });

  bot.on("error", (err) => {
    console.log("Error:", err);
  });
}

startBot();
