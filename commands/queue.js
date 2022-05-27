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
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { color_theme } = require('../config.json');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('View or change the music queue.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove songs from the queue.')
                .addNumberOption(option => 
                    option
                        .setName('start_position')
                        .setDescription('The queue position of the song(s) to remove.')
                        .setRequired(true)
                )
                .addNumberOption(option => 
                    option
                        .setName('end_position')
                        .setDescription('The last song in the range of songs being removed.')
                        .setRequired(false)
                )     
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('list')
                .setDescription('List the songs in queue.')
        )

    ,

    run: async function (client, interaction) {

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

            

            let { _subcommand, _hoistedOptions: opts } = interaction.options;

            // Handle the remove subcommand.
            if (_subcommand == 'remove') {
                const startPos = Math.round(opts[0].value);
                const endPos = opts[1] ? Math.round(opts[1].value) : startPos;

                // If this guild isn't controlling the music, return.
                if (GuildPlayer.controller) {
                    interaction.reply({
                        content: 'Your server is linked to another server! Use the `unlink` command to regain control over the music.',
                        ephemeral: true
                    });
                    return;
                }

                // If the end position is smaller than the start position, return.
                if (endPos < startPos) {
                    interaction.reply({
                        content: 'The end position must be after the start position!',
                        ephemeral: true
                    });
                    return;
                }

                // If there aren't any songs in the specified position, return.
                if (endPos > GuildPlayer.queue.length - 1) {
                    interaction.reply({
                        content: 'There\'s no song(s) in the specified queue position!',
                        ephemeral: true
                    });
                    return;
                }

                // The amount of songs being removed.
                const amount = endPos - startPos + 1;

                // The response that'll be sent to the user.
                let response = '';

                if (amount > 1) response = `${GuildPlayer.queue[startPos].name} and ${amount-1} other songs have been removed from the queue.`;
                else response = `${GuildPlayer.queue[startPos].name} was removed from the queue.`;
                
                GuildPlayer.queue.splice(startPos, amount);

                interaction.reply(response);
                return;
            }

            // Defer the reply because this might take a while.
            await interaction.deferReply();

            // Guard Clause: If subcommand isn't list, don't run anything else.
            if (_subcommand !== 'list') return;

            let queue = GuildPlayer.queue.slice(); // Clone of the queue array.
            let guildName = interaction.guild.name; // The name of the guild / linked guild.
            let repeat = GuildPlayer.repeat;
            let loop = GuildPlayer.loop;
    
            // If the MusicPlayer is linked to another guild.
            if (GuildPlayer.controller) {
                const OtherGuildPlayer = musicData.get(GuildPlayer.controller);
                if (OtherGuildPlayer) queue = OtherGuildPlayer.queue;
                guildName = client.guilds.cache.get(GuildPlayer.controller).name;
                repeat = OtherGuildPlayer.repeat;
                loop = OtherGuildPlayer.loop;
            }
    
            let count = 0;
            let pageData = [];
            let pages = [];
            const nowPlaying = queue.shift();

            queue.forEach(song => {
                const page = Math.ceil((count + 1) / 10);
                if (!pageData[page-1]) pageData.push([]);
                pageData[page-1].push(`[${count+1}] ${song.name}`);
                count++;
            });

            // If there are no songs in the queue, add "The queue is empty" to the pageData.
            if (pageData.length == 0) pageData.push(['The queue is empty.'])

            pageData.forEach(data => {
                const embed = new MessageEmbed()
                .setTitle(`Music Queue for ${guildName}`)
                .addField('Now Playing', nowPlaying.name)
                .addField('Songs in Queue', data.join('\n'))
                .addField('Repeat', repeat ? 'On' : 'Off', true)
                .addField('Loop', loop ? 'On' : 'Off', true)
                .setColor(color_theme)
                pages.push(embed);
            });
            
            let currentPage = 1;

            const row = new MessageActionRow()
            .addComponents(new MessageButton().setCustomId('previous').setLabel('Previous').setStyle('PRIMARY').setEmoji('⏮️'))
            .addComponents(new MessageButton().setCustomId('next').setLabel('Next').setStyle('PRIMARY').setEmoji('⏭️'))
            const disabledRow = new MessageActionRow()
            .addComponents(new MessageButton().setCustomId('previous').setLabel('Previous').setStyle('PRIMARY').setEmoji('⏮️').setDisabled(true))
            .addComponents(new MessageButton().setCustomId('next').setLabel('Next').setStyle('PRIMARY').setEmoji('⏭️').setDisabled(true))
            
            const response = await interaction.editReply({
                embeds: [pages[currentPage-1].setFooter({ text: `Page ${currentPage} of ${pages.length}` })],
                components: [row],
                fetchReply: true,
              });
            
              const filter = i => i.customId == 'previous' || i.customId == 'next' && i.user.id == interaction.member.id;
            
              const collector = await response.createMessageComponentCollector({
                filter,
                time: 15000,
              });
            
            collector.on("collect", async i => {
                if (i.customId == 'previous') {
                    if (currentPage > 1) currentPage--;
                }
                if (i.customId == 'next') {
                    if (currentPage < pages.length) currentPage++;
                }

                await i.deferUpdate();
                await i.editReply({
                    embeds: [pages[currentPage-1].setFooter({ text: `Page ${currentPage} of ${pages.length}` })],
                    components: [row],
                });
                collector.resetTimer();
            });

            collector.on("end", (_, reason) => {
                if (reason !== "messageDelete") {
                    response.edit({
                        embeds: [pages[currentPage-1].setFooter({ text: `Page ${currentPage} of ${pages.length}` })],
                        components: [disabledRow],
                    });
                }
            });  
        }
    }
}

