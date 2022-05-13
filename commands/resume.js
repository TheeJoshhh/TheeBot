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
        .setName('resume')
        .setDescription('Resume paused music.')
    ,

    run: async function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            const GuildPlayer = musicData.get(interaction.guild.id);
            const voiceChannel = interaction.member.voice.channel;

            // If the member isn't in the bots voice channel.
            if (!voiceChannel || voiceChannel.members.has(client.user.id) == false) {
                interaction.reply({
                    content: 'You must be in my voice channel to use that command!',
                    ephemeral: true
                });
                return;
            }

            // If there's no MusicPlayer for the guild.
            if (!GuildPlayer) {
                interaction.reply({
                    content: 'I\'m not playing music!',
                    ephemeral: true
                });
                return;
            }
            GuildPlayer.textId = interaction.channelId;

            // If there's no music queued in the guild.
            if (GuildPlayer.queue.length < 1) {
                interaction.reply({
                    content: 'I\'m not playing music!',
                    ephemeral: true
                });
                return;
            }

            // If the MusicPlayer is linked to another guild.
            if (GuildPlayer.controller) {
                interaction.reply({
                    content: `The music player is currently linked to guild with ID ${GuildPlayer.controller}. Use the command \`unlink\` if you want to unlink the music player.`,
                    ephemeral: true
                });
                return;
            }

            try {
                await GuildPlayer.resume();
                interaction.reply('Music Resumed.');
            } catch (e) {
                interaction.reply(e.message);
            }
            return;
        }
    }
}

