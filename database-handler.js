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

// Imports.
const Discord = require('discord.js');
const mongoose = require('mongoose');
const Guilds = require('./schemas/guild');
const { production_mode, production_mongo_uri, development_mongo_uri } = require('./config.json');

// Discord collections to hold cached data from the database.
const guildCache = new Discord.Collection();

// Exports.
module.exports.connect = connect;
module.exports.getGuildData = getGuildData;
module.exports.refreshCache = refreshCache;

// Function to connect to the database.
async function connect() {
    console.log('Connecting to the Database...');
    await mongoose.connect(production_mode ? production_mongo_uri : development_mongo_uri);
    console.log('Database Connected!');
}

// Function to get guild data for a specific guild.
async function getGuildData(guildId) {
    // If the guilds data is cached, return that.
    if (guildCache.has(guildId)) return guildCache.get(guildId);
    // Refresh the cache.
    const guildData = await refreshCache(guildCache);
    // Return the guild data.
    return guildData;
}

// Function to refresh the guild data cache for a specific guild.
async function refreshCache(guildId) {
    // Get the guild data from the database.
    const guildData = await Guilds.findById({ _id: guildId });
    // Update the cache.
    guildCache.set(guildId, guildData ? guildData : {});
    // Return the updated cache result.
    return guildCache.get(guildId);
}