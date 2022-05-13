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
const { getVoiceConnection } = require('@discordjs/voice');
const { musicData } = require('../voice-handler');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink the bot from another servers music.')
    ,

    run: async function (client, interaction) {
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

            // If the bot isn't in a voice channel, or isn't playing music.
            if (!interaction.guild.me.voice.channel || !musicData.has(interaction.guild.id)) {
                interaction.reply({
                    content: 'I\'m not playing any music!',
                    ephemeral: true
                });
                return;
            }
            
            // If the bot is in a different voice channel.
            if (interaction.guild.me.voice.channel !== interaction.member.voice.channel) {
                interaction.reply({
                    content: 'You must be in my voice channel to use that command!',
                    ephemeral: true
                });
                return;
            }

            const GuildPlayer = musicData.get(interaction.guild.id);
            GuildPlayer.textId = interaction.channelId;

            // If the bot isn't linked to another server.
            if (!GuildPlayer.controller) {
                interaction.reply({
                    content: 'I\'m not linked to another server!',
                    ephemeral: true
                });
                return;
            }

            GuildPlayer.subscription.unsubscribe();
            GuildPlayer.subscription = null;
            GuildPlayer.controller = null;
            interaction.reply('You\'re no longer listening along!');
            return;
        }
    }
}

