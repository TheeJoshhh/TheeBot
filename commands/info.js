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

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { color_theme, website, discord_server } = require('../config.json');
const { version, homepage } = require('../package.json');
const ms = require('ms');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides some useful information about the bot.')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // Create the embed that'll be sent to the user.
            const embed = new MessageEmbed()
                .setTitle(`Information About ${client.user.username}`)
                .setColor(color_theme)
                .setURL(website)
                .addField(
                    'Description', 
                    `${client.user.username} is a bot made by TheeJoshhh#9320.
                    This bot doesn't have any one purpose besides being a fun project to work on.`,
                    false
                )
                .addField('Servers', `${client.guilds.cache.size}`, true)
                .addField('Uptime', `${ms(client.uptime, { long: true })}`, true)
                .setFooter({ text: `${client.user.username} V${version}`, iconURL: client.user.avatarURL() })

            // Create the buttons that will show underneath the embed.
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('Website')
                        .setStyle('LINK')
                        .setURL(website)
                )
                .addComponents(
                    new MessageButton()
                        .setLabel('GitHub')
                        .setStyle('LINK')
                        .setURL(homepage)
                        .setEmoji('<:GitHub:966170492547530752>')
                )
                .addComponents(
                    new MessageButton()
                        .setLabel('Discord Server')
                        .setStyle('LINK')
                        .setURL(discord_server)
                        .setEmoji('<:Discord:966180598219698196>')
                )

            // Send the embed and buttons.
            interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }
}

