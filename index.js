const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.TOKEN || "7765845308:AAHcd9rFpYDhL60r--clJwl6xU1yYG7vGgM"; // Make sure this is correct
const server = express();
const bot = new TelegramBot(TOKEN);

// Serve static files for your game
server.use(express.static(path.join(__dirname, 'Build')));

// Set the webhook
bot.setWebHook(`https://mining-space-server.onrender.com/bot${TOKEN}`); // Replace with your Render app URL

// Handle Telegram updates via webhook
server.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Handle the other commands like before
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /game if you want to play."));

bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, "Miningspace"));

bot.on("callback_query", function (query) {
    if (query.game_short_name !== "Miningspace") {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = "https://alexdash555.github.io/Mining-Space-server/"; // Replace with the actual game URL
        bot.answerCallbackQuery(query.id, { url: gameurl });
    }
});

bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: "Miningspace"
    }]);
});

// Highscore API and other logic...

// Start the server
server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
