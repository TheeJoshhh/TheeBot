const { SlashCommandBuilder } = require('@discordjs/builders');
const Moderators = require('../schemas/moderator.js');
const { MessageEmbed } = require('discord.js');
const { color_theme } = require('../config.json');
const { version } = require('../package.json');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('moderators')
        .setDescription('Add, remove or list all users / roles that have access to moderator commands.')
        .addSubcommand(subCommand => 
            subCommand
                .setName('add')
                .setDescription('Give a role or user access to moderator commands.')
                .addMentionableOption(option =>
                    option
                        .setName('target')
                        .setDescription('The role or user to give moderator permissions to.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand => 
            subCommand
                .setName('remove')
                .setDescription('Remove a role or user\'s access to moderator commands.')
                .addMentionableOption(option =>
                    option
                        .setName('target')
                        .setDescription('The role or user to remove moderator permissions from.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand => 
            subCommand
                .setName('list')
                .setDescription('List roles and users with access to moderator commands.')
        )
    ,

    run: async function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // Destructure some properties for easy access.
            let { _subcommand, _hoistedOptions: opts } = interaction.options;
            opts = opts[0];

            // Get the guilds moderator data.
            let mod_data = await Moderators.findOne({ _id: interaction.guild.id });

            if (_subcommand == 'add' || _subcommand == 'remove') {
                // Get all required information about the target user or role.
                let target;
                const target_id = opts.value;
                const target_type = opts.user ? 'user' : 'role';

                // Get the target role or user.
                if (target_type == 'user') target = interaction.guild.members.cache.get(target_id).user;
                else target = interaction.guild.roles.cache.get(target_id);

                // If the target isn't found, error.
                if (!target) return interaction.reply('Error: Target not found.');

                // Determine the target role or user's name.
                const target_name = target_type == 'user' ? target.username : target.name;

                // Check if the target exists in the database.
                let target_exists = false;
                if (mod_data) {
                    if (mod_data[target_type + 's'].includes(target_id)) target_exists = true;
                }

                let update = target_type == 'user' ? { users: target_id } : { roles: target_id };
                if (_subcommand == 'add') {
                    // Check if the target already exists in the database.
                    if (target_exists) return interaction.reply(`The ${target_type}'s ID already has moderator privileges!`);
                    // Update the database.
                    mod_data = await Moderators.findOneAndUpdate({ _id: interaction.guild.id }, { $push: update }, { upsert: true });                    
                    return interaction.reply(`The ${target_type} \`${target_name}\` now has moderator privileges!`);
                } else {
                    // Make sure the target already exists in the database.
                    if (!target_exists) return interaction.reply(`The ${target_type}'s ID doesn't have moderator privileges!`);
                    // Remove the target from the database.
                    mod_data = await Moderators.findOneAndUpdate({ _id: interaction.guild.id }, { $pull: update }, { upsert: true });                    
                    return interaction.reply(`The ${target_type} \`${target_name}\` no longer has moderator privileges!`);
                }
            } else if (_subcommand == 'list') {
                if (!mod_data) return interaction.reply('There are no moderators set in this guild.');
                
                let roles = [];
                for (x = 0; x < mod_data.roles.length; x++) {
                    const role = interaction.guild.roles.cache.get(mod_data.roles[x]);
                    if (role) roles.push(role.name);
                }
                if (roles.length == 0) roles.push("None...")

                let users = [];
                for (x = 0; x < mod_data.users.length; x++) {
                    const user = interaction.client.users.cache.get(mod_data.users[x]);
                    if (user) users.push(user.tag);
                    else users.push(`Unknown User (ID: ${user_id})`);
                }
                if (users.length == 0) users.push("None...")

                const embed = new MessageEmbed()
                .setTitle(`${interaction.guild.name} Moderators`)
                .addField('Roles', roles.join('\n'), true)
                .addField('Users', users.join('\n'), true)
                .setColor(color_theme)
                .setFooter({ text: `${client.user.username} V${version}`, iconURL: client.user.avatarURL() });
                return interaction.reply({ embeds: [embed] });
            } else {
                interaction.reply('Error: Unknown sub-command.');
            }
        }
    }
}

