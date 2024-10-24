const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.TOKEN || "7765845308:AAHcd9rFpYDhL60r--clJwl6xU1yYG7vGgM"; // Ensure this is correct
const server = express();
const bot = new TelegramBot(TOKEN, { polling: true });

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

// Handle the other commands like before
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /game if you want to play."));

// Start and game commands handler
bot.onText(/start|game/, (msg) => {
    // Ensure `msg` object and `msg.from.id` are valid before proceeding
    if (msg && msg.from && msg.from.id) {
        bot.sendGame(msg.from.id, "Miningspace");
    } else {
        console.log("Invalid message object or user ID.");
    }
});

bot.on("callback_query", function (query) {
    if (query.game_short_name !== "Miningspace") {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        // No link is sent to chat, just answering the callback query
        bot.answerCallbackQuery(query.id);
    }
});

// Handle inline queries
bot.on("inline_query", function (iq) {
    if (iq && iq.id) {
        bot.answerInlineQuery(iq.id, [{
            type: "game",
            id: "0",
            game_short_name: "Miningspace"
        }]);
    } else {
        console.log("Invalid inline query object.");
    }
});

// Start the server
server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
