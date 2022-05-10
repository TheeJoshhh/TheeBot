// Import required modules.
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { production_mode, development_guilds, production_token, development_token } = require('./config.json');
const { getFiles } = require('./utils.js');

module.exports = (client) => {
    // An object that'll hold all of the commands.
    const commands = {};
    // An array of data to be sent to the discord API.
    const commandAPIData = [];

    // Get a list of all of the files in the commands folder.
    const commandFiles = getFiles('./commands');
    
    // Loop over all of the files in the commands folder.
    for (const command of commandFiles) {
        const commandFile = require(command);
        const commandInfo = commandFile.info.toJSON();
        commands[commandInfo.name] = commandFile;
        commandAPIData.push(commandInfo);
    }

    // Send the slash commands to the discord API.
    (async function () {
        console.log('Updating slash commands...');
        const rest = new REST({ version: '9' }).setToken(production_mode ? production_token : development_token);
        try {
            if (production_mode) {
                await rest.put(
                    Routes.applicationCommands(client.user.id),
                    { body: commandAPIData },
                );
            } else {
                development_guilds.forEach( async guild_id => {
                    const guild = client.guilds.cache.get(guild_id);
                    if (guild) {
                        await rest.put(
                            Routes.applicationGuildCommands(client.user.id, guild.id),
                            { body: commandAPIData },
                        );
                    } else console.log(`Development guild with ID: \`${guild_id}\` not found.`)
                });
            }
        } catch (err) { console.error(err); }
        console.log('Finished updating slash commands.');
    })();


    // When the bot receives an interaction.
    client.on('interactionCreate', async (interaction) => {
        // Handle commands, buttons and interactions.
        if (interaction.isCommand() || interaction.isButton() || interaction.isSelectMenu()) {
            // Determins the name of the original command.
            let commandName = interaction.isCommand() ? interaction.commandName : interaction.message.interaction.commandName;
            // Find and run the command (if it exists).
            if (!commands[commandName]) return console.log(`Missing Command: ${commandName}!!`);
            commands[commandName].run(client, interaction);
        }
    });
}