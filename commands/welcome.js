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
const { checkMod } = require('../utils');
const Guilds = require('../schemas/guild');

module.exports = {
    info: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Edit the welcome message for this server.')
        .addSubcommand(subCommand =>
            subCommand
                .setName('set')
                .setDescription('Set the channel and text for the welcome message.')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel for the welcome message to be sent in.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('The message that will be sent in the welcome channel when a new member joins the server.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('disable')
                .setDescription('Disable the welcome message.')
        )
    ,

    run: async function (client, interaction) {
        if (!checkMod(interaction.member)) return interaction.reply('Only moderators can use this command!');

        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            const { _subcommand, _hoistedOptions: options } = interaction.options;
            if (_subcommand == 'disable') {
                try {
                    await Guilds.findOneAndUpdate({ _id: interaction.guild.id }, { $set: {'welcome_message.channel_id': ''} }, { upsert: true })
                } catch (err) {
                    console.error(err);
                    return interaction.reply('There was an error saving to the database. Please try again later.')
                }
                return interaction.reply('Welcome message is now disabled.');
            }
            if (_subcommand == 'set') {
                const channel = options[0].channel;
                const message = options[1].value;
                if (message.length > 200) return interaction.reply('The welcome message must be less than 200 characters long!');
                try {
                    await Guilds.findOneAndUpdate(
                        { _id: interaction.guild.id }, 
                        { $set: {'welcome_message.channel_id': channel.id, 'welcome_message.channel_name': channel.name, 'welcome_message.message': message}},
                        { upsert: true }
                    )
                } catch (err) {
                    console.error(err)
                    return interaction.reply('There was an error saving to the database. Please try again later.')
                }
                return interaction.reply(
                    `Welcome message and channel set. Welcome messages will now go to the ${channel} channel. The new welcome message is \`${message}\``
                );
            }
        }
    }
}

