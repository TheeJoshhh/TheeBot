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
        .setName('skip')
        .setDescription('Skip the current song.')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            const GuildPlayer = musicData.get(interaction.guild.id);
            const voiceChannel = interaction.member.voice.channel;
            if (!GuildPlayer) {
                interaction.reply({
                    content: 'I\'m not playing music!',
                    ephemeral: true
                });
                return;
            }
            // If the member isn't in the bots voice channel.
            if (!voiceChannel || voiceChannel.members.has(client.user.id) == false) {
                interaction.reply({
                    content: 'You must be in my voice channel to use that command!',
                    ephemeral: true
                });
                return;
            }

            // If the user is the one that queued the song, let them skip it.
            if (GuildPlayer.queue[0].queuedBy.id == interaction.member.id) {
                interaction.reply('Skipping...');
                GuildPlayer.next();
                return;
            }
            
            // Check the votes vs the number of people in the call in case someone left.
            let votes = 0;
            let requiredVotes = Math.round((voiceChannel.members.size - 1) / 2);
            GuildPlayer.queue[0].voteSkip.forEach(id => {
                if (voiceChannel.members.has(id)) votes++
            });

            if (votes >= requiredVotes) {
                interaction.reply('Skipping...');
                GuildPlayer.next();
                return;
            }

            // If the member has already voted to skip.
            if (GuildPlayer.queue[0].voteSkip.includes(interaction.member.id)) {
                interaction.reply({
                    content: 'You\'ve already voted to skip this song!',
                    ephemeral: true
                });
                return; 
            }
            votes++;
            if (votes >= requiredVotes) {
                interaction.reply('Skipping...');
                GuildPlayer.next();
                return;
            } else {
                GuildPlayer.queue[0].voteSkip.push(interaction.member.user.id);
                interaction.reply(`${votes} out of ${requiredVotes} needed to skip.`);
                return;
            }
        }
    }
}

