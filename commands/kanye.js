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

module.exports = {

    info: new SlashCommandBuilder()
        .setName('kanye')
        .setDescription('Free kanye west quotes for everyone!! for those who want it...')
    ,

    run: async function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // Function to get kanye west quotes from the kanye rest API.
            async function getQuote() {
                try {
                    const quote = await (await axios.get('https://api.kanye.rest/')).data.quote;
                    return quote ? quote : 'There was an error retrieving kanye west greatness...';
                } catch (error) {
                    console.error(error);
                    return 'There was an error retrieving kanye west greatness...';
                }
            }

            // Get a kanye west quote.
            const quote = await getQuote();

            // Send the kanye west quote.
            interaction.reply(quote);
        }
    }
}

