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

const axios = require('axios').default;
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { color_theme } = require('../config.json')

module.exports = {

    info: new SlashCommandBuilder()
        .setName('dbd')
        .setDescription('Search for information about dead by daylight perks and characters.')
            .addStringOption(option =>
                option.setName('type')
                .setDescription('The type of info to retrieve. (killer, survivor or perk)')
                .setRequired(true)
                .addChoices(
                    { name: 'Perk', value: 'perks' },
                    { name: 'Survivor', value: 'survivors' },
                    { name: 'Killer', value: 'killers' }
                )
            )
        
        .addStringOption(option => 
            option.setName('query')
            .setDescription('The name of a perk, survivor or killer.')
            .setRequired(true)
        )
    ,

    run: async function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            const type = interaction.options.getString('type');
            const query = interaction.options.getString('query');

            // Ensure options are provided.
            if (!type || !query) return interaction.reply({ content: 'Error, please try again later.', ephemeral: true });

            // Retrieve data and filter though it for the user query.
            const data = await (await axios.get(`https://dbd-api.herokuapp.com/${type}`)).data;
            if (!data) return interaction.reply({ content: 'Error, please try again later.', ephemeral: true });

            const filteredData = data.filter(function (e) {
                let found = false;
                if (type === 'survivors' || type === 'killers') {
                    if (e.name.toLowerCase().includes(query.toLowerCase())) found = true;
                    if (e.full_name.toLowerCase().includes(query.toLowerCase())) found = true;
                    if (e.name_tag.toLowerCase().includes(query.toLowerCase())) found = true;
                } 
                if (type === 'killers') {
                    if (e.alias.toLowerCase().includes(query.toLowerCase())) found = true;
                }
                if (type === 'perks') {
                    if (e.perk_name.toLowerCase().includes(query.toLowerCase())) found = true;
                    if (e.perk_tag.toLowerCase().includes(query.toLowerCase())) found = true;
                }
                return found;
            });

            if (!filteredData[0]) return interaction.reply({ content: `Couldn't find any ${type} with the name \`${query}\`.`, ephemeral: true });
            const result = filteredData[0];

            const embed = new MessageEmbed()
                .setColor(color_theme);
            
            if (type === 'survivors') {
                embed
                    .setTitle(`${result.name}`)
                    .setThumbnail(result.icon.portrait)
                    .addField('Full Name', result.full_name ? result.full_name : result.name, true)
                    .addField('Gender', result.gender, true)
                    .addField('Nationality', result.nationality, true)
                    .addField('Role', result.role, true)
                    .addField('DLC', result.dlc, true)
                    .addField('Free', result.is_free ? 'Yes' : 'No', true)
                    .addField('Perks', result.perks.join(', '), true)
                    .addField('Voice Actor', result.voice_actor, true)
                    .addField('Overview', result.overview)
            } else if (type === 'killers') {
                embed
                .setTitle(`${result.name}`)
                .setThumbnail(result.icon.portrait)
                .addField('Full Name', result.full_name ? result.full_name : result.name, true)
                .addField('Alias Name(s)', result.alias, true)
                .addField('Gender', result.gender, true)
                .addField('Nationality', result.nationality, true)
                .addField('Realm', result.realm, true)
                .addField('Power', result.power, true)
                .addField('Speed', result.speed, true)
                .addField('Height', result.height, true)
                .addField('Terror Radius Size', result.terror_radius, true)
                .addField('DLC', result.dlc, true)
                .addField('Free', result.is_free ? 'Yes' : 'No', true)
                .addField('Perks', result.perks.join(', '), true)
                .addField('Voice Actor', result.voice_actor, true)
                .addField('Overview', result.overview)
            } else {    
                embed
                    .setTitle(`${result.perk_name}`)
                    .setThumbnail(result.icon)
                    .addField('Role', result.role, true)
                    .addField('Character(s)', result.name, true)
                    .addField('Teachable Level', result.teach_level.toString(), true)
                    .addField('Description', result.description)
            }

            return interaction.reply({ embeds: [embed] })
        }
    }
}

