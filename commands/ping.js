const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping, Pong!')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            interaction.reply({
                content: 'Pong!!',
                ephemeral: true
            });
        }
    }
}

