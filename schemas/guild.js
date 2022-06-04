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

const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    welcome_message: {
        channel_id: {type: String, default: ''},
        channel_name: {type: String, default: ''},
        message: {type: String, default: 'Welcome to the server ${member}!'}
    },
    autoKick: {type: Boolean, default: false},
    autoBan: {type: Boolean, default: false},
    warningsBeforeKick: {type: Number, default: 3},
    warningsBeforeBan: {type: Number, default: 5},
    voteSkipPercentage: {type: Number, default: 50},
    autoDisconnect: { type: String, default: "channel_empty" } // "disabled", "music_end" or "channel_empty"
});

module.exports = mongoose.model('Guilds', GuildSchema);