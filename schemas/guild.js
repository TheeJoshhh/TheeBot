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
    _id: String,
    welcome_message: {
        channel_id: {type: String, default: ''},
        channel_name: {type: String, default: ''},
        message: {type: String, default: 'Welcome to the server ${member}!'}
    },
    musicPlayer: {
        type: Object, 
        default: {
            queue: {
                type: Array, 
                default: [
                    {
                        url: {type: String}, 
                        name: {type: String}, 
                        skips: {type: Number}, 
                        length: {type: Number}, 
                        queued_by: {type: String}}
                ]
            },
            repeat: {type: Boolean, default: false},
            loop: {type: Boolean, default: false},
            player: {type: Object, default: {}},
            text_channel: {type: String, default: ''}
        }
    },
    autoKick: {type: Boolean, default: false},
    autoBan: {type: Boolean, default: false},
    warningsBeforeKick: {type: Number, default: 3},
    warningsBeforeBan: {type: Number, default: 5},
    voteSkipPercentage: {type: Number, default: 50}
});

module.exports = mongoose.model('Guilds', GuildSchema);