// Import required modules.
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { production_mode, development_guilds } = require('./config.json');
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

        // Add the commandFile to the commands object with the command's name as the key.
        commands[commandInfo.name] = commandFile;
        console.log(`Loaded ${commandInfo.name}.`);

        commandAPIData.push(commandInfo);
    }

    // Send the slash commands to the discord API.
    (async () => {
        const rest = new REST({ version: '9' }).setToken('token');
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
                    }
                });
            }
        } catch (err) { console.error(err); }
    });


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