const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.TOKEN || "YOUR_TOKEN";
const server = express();
const bot = new TelegramBot(TOKEN);

// Middleware to parse JSON request bodies
server.use(express.json());

// Serve static files for your game
server.use(express.static(path.join(__dirname, 'Build')));

// Set the webhook
bot.setWebHook(`https://mining-space-server.onrender.com/bot${TOKEN}`);

// Handle Telegram updates via webhook
server.post(`/bot${TOKEN}`, (req, res) => {
    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error processing update:", error);
        res.sendStatus(500);
    }
});

// Serve index.html as the default
server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Build', 'index.html'));
});

// Start the server
server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
