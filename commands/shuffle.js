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
        .setName('shuffle')
        .setDescription('Shuffles the music queue.')
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

            // If the user isn't in the bots voice channel.
            if (interaction.member.voice.channel !== interaction.guild.me.voice.channel) {
                interaction.reply({
                    content: `You must be in my voice channel to use that command!`,
                    ephemeral: true
                });
                return;
            }

            // If there aren't enough songs to shuffle.
            if (GuildPlayer.queue.length <= 2) {
                interaction.reply({
                    content: `There aren't enough songs in queue to shuffle them!`,
                    ephemeral: true
                });
                return;
            }

            // Fisher-Yates algorithm to shuffle array.
            const shuffleArray = array => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
            }

            const nowPlaying = GuildPlayer.queue.shift(); // Take the now playing song out of the array.
            GuildPlayer.queue = shuffleArray(GuildPlayer.queue); // Shuffle the array.
            GuildPlayer.queue.unshift(nowPlaying); // Add the now playing song back to the start of the array.
            interaction.reply('The queue has been shuffled.');
              
        }
    }
}

