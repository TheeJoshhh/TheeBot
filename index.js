// Import required modules.
const Discord = require('discord.js');
const mongoose = require('mongoose');
const { Intents } = Discord;
const { 
    production_mode, 
    production_token, 
    development_token, 
    production_mongo_uri, 
    development_mongo_uri 
} = require('./config.json');
const command_handler = require('./command-handler');



// Create the discord.js client.
const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Ready Event (Fired when the bot is online and ready).
client.on('ready', async () => {
    // Connect the database.
    console.log('Connecting to the Database...');
    await mongoose.connect(production_mode ? production_mongo_uri : development_mongo_uri);
    console.log('Database Connected!');
    
    // Load the command handler.
    command_handler(client);
    console.log(`${client.user.username} is now online and ready to receive commands!`);
});

// Login to the bot account.
client.login(production_mode ? production_token : development_token);