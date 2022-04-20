// Import required modules.
const Discord = require('discord.js');
const { Intents } = Discord;
const { production_mode, production_token, development_token } = require('./config.json');
const command_handler = require('./command-handler');

// Create the discord.js client.
const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Ready Event (Fired when the bot is online and ready).
client.on('ready', () => {
    command_handler(client);
    console.log(`${client.user.username} is now online and ready to receive commands!`);
});

// Login to the bot account.
client.login(production_mode ? production_token : development_token);