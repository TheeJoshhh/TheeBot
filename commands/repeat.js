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

const { SlashCommandBuilder } = require('@discordjs/builders');
const { musicData } = require('../voice-handler');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Makes the current song play on repeat.')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            const GuildPlayer = musicData.get(interaction.guild.id);

            // If there's no MusicPlayer for the guild.
            if (!GuildPlayer) {
                interaction.reply({
                    content: 'I\'m not playing music!',
                    ephemeral: true
                });
                return;
            }

            // If there's no music queued in the guild.
            if (GuildPlayer.queue.length < 1 && GuildPlayer.controller == null) {
                interaction.reply({
                    content: 'I\'m not playing music!',
                    ephemeral: true
                });
                return;
            }

            let response = '';

            if (GuildPlayer.repeat === false) {
                GuildPlayer.repeat = true;
                response = 'Repeat mode `enabled`.'
                if (GuildPlayer.loop === true) {
                    GuildPlayer.loop = false;
                    response += ' (Loop mode was automatically disabled)'
                }
            } else {
                GuildPlayer.repeat = false;
                response = 'Repeat mode `disabled`.'
            }

            // Send the embed and buttons.
            interaction.reply(response);
        }
    }
}

