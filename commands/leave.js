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
        .setName('leave')
        .setDescription('Makes the bot leave your current voice channel.')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // Make sure the user is in a voice channel.
            if (!interaction.member.voice.channel)
            return interaction.reply('You must be in a voice channel to use that command!');

            // Make sure the bot is in a voice channel.
            if (!musicData.has(interaction.guild.id))
            return interaction.reply('I\'m not in a voice channel!');

            musicData.get(interaction.guild.id).destroy();

            interaction.reply({
                content: 'Leaving your channel...',
                ephemeral: false
            });
            return;
        }
    }
}

