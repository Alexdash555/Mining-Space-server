const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

// Use the real Telegram Bot token from the environment variable or hardcoded (use with caution)
const TOKEN = process.env.TOKEN || "7765845308:AAHcd9rFpYDhL60r--clJwl6xU1yYG7vGgM"; 

const server = express();
const bot = new TelegramBot(TOKEN, { polling: true });

const port = process.env.PORT || 5000;
const gameName = "Miningspace"; // This should be the short name of your game
const queries = {};

// Serve static files for your game (adjust this if "Build" isn't your correct folder)
server.use(express.static(path.join(__dirname, 'Build')));

// Handle /help command
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /game if you want to play."));

// Handle /start and /game commands
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));

// Handle callback queries
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = "https://alexdash555.github.io/Mining-Space-server/"; // Replace with your GitHub game link or Render link
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });
    }
});

// Handle inline queries
bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameName
    }]);
});

// Highscore API
server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options, function (err, result) {
        if (err) {
            console.error('Error setting score:', err);
        } else {
            console.log('Score set:', result);
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
