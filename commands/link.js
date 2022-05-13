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
const { MusicPlayer, musicData } = require('../voice-handler');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link the bots music to another server.')
        .addStringOption(option => 
            option
                .setName('server')
                .setDescription('The ID of the server to link the music to.')
                .setRequired(true)
        )
    ,

    run: async function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // The supplied guild ID.
            const serverId = interaction.options.getString('server');

            // Make sure the user is in a voice channel.
            if (!interaction.member.voice.channel) {
                interaction.reply({
                    content: `You must be in a voice channel to use that command!`,
                    ephemeral: true
                });
                return;
            }
            
            // If the bot is already in a different voice channel.
            if (interaction.guild.me.voice.channel && interaction.guild.me.voice.channel !== interaction.member.voice.channel) {
                interaction.reply({
                    content: 'I\'m already in another voice channel!',
                    ephemeral: true
                });
                return;
            }


            // If there isn't one already, create a music player.
            if (!musicData.has(interaction.guild.id)) new MusicPlayer(interaction.guild.id);

            const GuildPlayer = musicData.get(interaction.guild.id);
            GuildPlayer.textId = interaction.channelId;

            // If there isn't one already, create a voice connection.
            if (!getVoiceConnection(interaction.guild.id)) {
                try {
                    GuildPlayer.connect(interaction.member.voice.channel);
                } catch (e) {
                    console.error(e);
                    interaction.reply({
                        content: 'An error occured while joining your channel. Please try again later.', 
                        ephemeral: true
                    });
                    return;
                }
            }

            if (!musicData.has(serverId)) {
                interaction.reply({
                    content: 'There is no music playing in that guild!', 
                    ephemeral: true
                });
                return;
            }

            const OtherGuildPlayer = musicData.get(serverId);

            if (!OtherGuildPlayer.player) {
                interaction.reply({
                    content: 'There is no music playing in that guild!', 
                    ephemeral: true
                });
                return;
            }

            GuildPlayer.controller = serverId;
            GuildPlayer.subscription = getVoiceConnection(interaction.guild.id).subscribe(OtherGuildPlayer.player);
            interaction.reply('You\'re now listening along!');
            return;
        }
    }
}

