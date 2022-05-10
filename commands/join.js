const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicPlayer, musicData } = require('../voice-handler');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Makes the bot join your current voice channel.')
    ,

    run: function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // Make sure the user is in a voice channel.
            if (!interaction.member.voice.channel) {
                interaction.reply({
                    content: `You must be in a voice channel to use that command!`,
                    ephemeral: true
                });
                return;
            }
            

            // If the bot is already in a voice channel.
            if (interaction.guild.me.voice.channel) {
                interaction.reply({
                    content: 'I\'m already in a voice channel',
                    ephemeral: true
                });
                return;
            }

            // Create a MusicPlayer and join the user's channel.
            new MusicPlayer(interaction.guild.id);
            const GuildPlayer = musicData.get(interaction.guild.id);

            try {
                GuildPlayer.connect(interaction.member.voice.channel);
                interaction.reply(`Joined \`${interaction.member.voice.channel.name}\`!`);
            } catch (e) {
                console.error(e);
                interaction.reply({
                    content: 'An error occured while joining your channel. Please try again later.',
                    ephemeral: true
                });
            }
            return;
        }
    }
}

