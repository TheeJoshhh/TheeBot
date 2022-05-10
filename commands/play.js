const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl');
const guild = require('../schemas/guild');
const { MusicPlayer, Song, musicData } = require('../voice-handler');

module.exports = {

    info: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song in your voice channel.')
        .addStringOption(option => 
            option
                .setName('query')
                .setDescription('The song name or the youtube, spotify or soundcloud url.')
                .setRequired(true)
        )
    ,

    run: async function (client, interaction) {
        // HANDLE COMMANDS.
        if (interaction.isCommand()) {
            // The search query.
            const query = interaction.options.getString('query');

            // If the spotify token is expired, refresh it.
            if (play.is_expired()) {
                await play.refreshToken();
            }

            // Make sure the user is in a voice channel.
            if (!interaction.member.voice.channel) {
                interaction.reply({
                    content: `You must be in a voice channel to use that command!`,
                    ephemeral: true
                });
                return;
            }
            
            // If the bot is already in a different voice channel.
            if (interaction.guild.me.voice.channel && interaction.guild.me.voice.channel !== interaction.member.voice.channel) {
                interaction.reply({
                    content: 'I\'m already in another voice channel!',
                    ephemeral: true
                });
                return;
            }

            await interaction.deferReply();

            // If there isn't one already, create a music player.
            if (!musicData.has(interaction.guild.id)) new MusicPlayer(interaction.guild.id);

            const GuildPlayer = musicData.get(interaction.guild.id);

            // If there isn't one already, create a voice connection.
            if (!getVoiceConnection(interaction.guild.id)) {
                try {
                    GuildPlayer.connect(interaction.member.voice.channel);
                } catch (e) {
                    console.error(e);
                    interaction.editReply({
                        content: 'An error occured while joining your channel. Please try again later.',
                        ephemeral: true
                    });
                    return;
                }
            }

            // If the MusicPlayer is linked to another guild.
            if (GuildPlayer.controller) {
                interaction.editReply({
                    content: `The music player is currently linked to guild with ID ${GuildPlayer.controller}. Use the command \`unlink\` if you want to unlink the music player.`,
                    ephemeral: true
                });
                return;
            }

            let songInfo;

            const type = await play.validate(query);
            console.log(type);
            
            // If the query is a spotify url.
            if (type == 'sp_track') {                
                const info = await play.spotify(query)
                if (info) songInfo = {name: `${info.artists[0].name} - ${info.name}`};
            } else if (type == 'so_track') { // If the query is a soundcloud url.
                const info = await play.soundcloud(query);
                if (info) songInfo = {
                    name: info.name,
                    url: info.url,
                    length: info.durationInSec
                }
            } else if (type == 'yt_video') { // If the query is a youtube url.
                try {
                    const info = await play.video_info(query);
                    if (info) songInfo = {
                        name: info.video_details.title,
                        url: info.video_details.url,
                        length: info.video_details.durationInSec
                    }
                } catch (error) {
                    if (error.message.includes("Sign in to confirm your age")) {
                        interaction.editReply('Sorry, youtube doesn\'t let me play age restricted videos.');
                        return;
                    } 
                }
            } else if (type == 'search') { // Assume it's a search query and not a url.
                const info = await play.search(query, {limit:1});
                if (info[0]) songInfo = {
                    name: info[0].title,
                    url: info[0].url,
                    length: info[0].durationInSec
                }
            } else {
                interaction.editReply({
                    content: 'Sorry, that type of link isn\'t supported yet',
                    ephemeral: true
                });
                return;
            }

            if (!songInfo) { // If the song variable hasn't been changed.
                interaction.editReply({
                    content: 'There was an error finding your song.',
                    ephemeral: true
                });
                return;
            }

            const song = new Song(
                songInfo.name, 
                interaction.member, 
                songInfo.url ? songInfo.url : null, 
                songInfo.length ? songInfo.length : null
            );
            
            const result = await GuildPlayer.play(song);
            interaction.editReply(result);
        }
    }
}

