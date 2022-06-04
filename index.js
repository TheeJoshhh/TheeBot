/*
    Copyright (C) 2022 Joshua Billing / TheeJoshhh

    TheeBot is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    TheeBot is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with TheeBot.  If not, see <https://www.gnu.org/licenses/>.
*/

// Import required modules.
const Discord = require('discord.js');
const { Intents } = Discord;
const { 
    production_mode, 
    production_token, 
    development_token, 
    production_mongo_uri, 
    development_mongo_uri 
} = require('./config.json');
const command_handler = require('./command-handler');
const { connect, getGuildData } = require('./database-handler');
const Guilds = require('./schemas/guild');

// Create the discord.js client.
const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

// Ready Event (Fired when the bot is online and ready).
client.on('ready', async () => {
    // Connect the database.
    connect();
    
    // Load the command handler.
    command_handler(client);
    console.log(`${client.user.username} is now online and ready to receive commands!`);
});

// GuildMemberAdd Event (Fired when a new member joins a guild).
client.on('guildMemberAdd', async (member) => {
    const { guild } = member;
    const guild_data = getGuildData(guild.id);
    if (!guild_data || guild_data == {}) return;
    const welcome_channel = guild.channels.cache.get(guild_data.welcome_message.channel_id);
    if (!welcome_channel) return;
    welcome_channel.send(guild_data.welcome_message.message.replace('${member}', member));
});

// Login to the bot account.
client.login(production_mode ? production_token : development_token);

module.exports = client;