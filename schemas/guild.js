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