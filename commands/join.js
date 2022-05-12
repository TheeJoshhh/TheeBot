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
const { MusicPlayer, musicData } = require('../voice-handler');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Makes the bot join your current voice channel.')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // Make sure the user is in a voice channel.
            if (!interaction.member.voice.channel) {
                interaction.reply({
                    content: `You must be in a voice channel to use that command!`,
                    ephemeral: true
                });
                return;
            }
            

            // If the bot is already in a voice channel.
            if (interaction.guild.me.voice.channel) {
                interaction.reply({
                    content: 'I\'m already in a voice channel',
                    ephemeral: true
                });
                return;
            }

            // Create a MusicPlayer and join the user's channel.
            new MusicPlayer(interaction.guild.id);
            const GuildPlayer = musicData.get(interaction.guild.id);

            try {
                GuildPlayer.connect(interaction.member.voice.channel);
                interaction.reply(`Joined \`${interaction.member.voice.channel.name}\`!`);
            } catch (e) {
                console.error(e);
                interaction.reply({
                    content: 'An error occured while joining your channel. Please try again later.',
                    ephemeral: true
                });
            }
            return;
        }
    }
}

