// Import required modules.
const { production_mode, development_guilds } = require('./config.json');
const { getFiles } = require('./utils.js');

module.exports = (client) => {
    // An object that'll hold all of the commands.
    const commands = {};

    // Get a list of all of the files in the commands folder.
    const commandFiles = getFiles('./commands');
    
    // Loop over all of the files in the commands folder.
    for (const command of commandFiles) {
        const commandFile = require(command);
        const commandInfo = commandFile.info.toJSON();

        // Add the commandFile to the commands object with the command's name as the key.
        commands[commandInfo.name] = commandFile;
        console.log(`Loaded ${commandInfo.name}.`);

        // The fields that will be sent to discord to create the slash commands.
        cmdFields = {
            name: commandInfo.name,
            description: commandInfo.description,
            options: commandInfo.options ? commandInfo.options : []
        }

        if (production_mode) {
            // Add the command to bot globally. (takes time to register)
            client.application.commands.create(cmdFields);
        } else {
            // Add the command to all of the development guilds. (registers immediately)
            development_guilds.forEach(guild_id => {
                const guild = client.guilds.cache.get(guild_id);
                if (guild) guild.commands.create(cmdFields); 
            });
        }
        
    }

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