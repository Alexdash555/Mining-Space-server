const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.TOKEN || "7765845308:AAFs2yDsgQyBWTsXyjIhgE7VsWwzRrpKPrM"; // Make sure this is correct
const server = express();
const bot = new TelegramBot(TOKEN);

// Middleware to parse JSON request bodies
server.use(bodyParser.json());

// Serve static files from the 'Build' folder
server.use("/Build", express.static(path.join(__dirname, 'Build')));

// Serve the index.html from the root directory
server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Set the webhook
bot.setWebHook(`https://mining-space-server.onrender.com/bot${TOKEN}`); // Replace with your Render app URL

// Handle Telegram updates via webhook
server.post(`/bot${TOKEN}`, (req, res) => {
    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error processing update:", error);
        res.sendStatus(500); // Respond with a server error status if something goes wrong
    }
});

// Handle the /help command
bot.onText(/help/, (msg) => {
    if (msg && msg.from) {
        bot.sendMessage(msg.from.id, "Say /game if you want to play.");
    }
});

// Handle the /start or /game command
bot.onText(/start|game/, (msg) => {
    if (msg && msg.from) {
        bot.sendGame(msg.from.id, "Miningspace");
    }
});

// Handle callback queries
bot.on("callback_query", (query) => {
    if (query && query.game_short_name === "Miningspace") {
        let gameurl = "https://alexdash555.github.io/Mining-Space-server/"; // Replace with the actual game URL
        bot.answerCallbackQuery(query.id, { url: gameurl });
    } else {
        bot.answerCallbackQuery(query.id, "Sorry, that game is not available.");
    }
});

// Handle inline queries
bot.on("inline_query", (iq) => {
    if (iq && iq.id) {
        bot.answerInlineQuery(iq.id, [{
            type: "game",
            id: "0",
            game_short_name: "Miningspace"
        }]);
    }
});

// Start the server
server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
