const { SlashCommandBuilder } = require('@discordjs/builders');
const { musicData } = require('../voice-handler');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Makes the bot leave your current voice channel.')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // Make sure the user is in a voice channel.
            if (!interaction.member.voice.channel)
            return interaction.reply('You must be in a voice channel to use that command!');

            // Make sure the bot is in a voice channel.
            if (!musicData.has(interaction.guild.id))
            return interaction.reply('I\'m not in a voice channel!');

            musicData.get(interaction.guild.id).destroy();

            interaction.reply({
                content: 'Leaving your channel...',
                ephemeral: false
            });
            return;
        }
    }
}

