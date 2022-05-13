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

const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl');
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
                    interaction.editReply('An error occured while joining your channel. Please try again later.');
                    return;
                }
            }

            // If the MusicPlayer is linked to another guild.
            if (GuildPlayer.controller) {
                interaction.editReply(`The music player is currently linked to guild with ID ${GuildPlayer.controller}. Use the command \`unlink\` if you want to unlink the music player.`);
                return;
            }

            let songInfo = [];

            const type = await play.validate(query);
            console.log(type);
            
            // If the query is a spotify url.
            if (type == 'sp_track') {                
                const info = await play.spotify(query)
                if (info) songInfo.push({name: `${info.artists[0].name} - ${info.name}`});
            
            } else if (type == 'sp_album') {
                const album = await play.spotify(query) 
                const tracks = await album.all_tracks();
                tracks.forEach(track => {
                    songInfo.push({name: `${track.name}`});
                });
            } else if (type == 'sp_playlist') {
                const playlist = await play.spotify(query) 
                const tracks = await playlist.all_tracks();
                tracks.forEach(track => {
                    songInfo.push({name: `${track.name}`});
                });
            } else if (type == 'so_track') { // If the query is a soundcloud url.
                const info = await play.soundcloud(query);
                if (info) songInfo.push({
                    name: info.name,
                    url: info.url,
                    length: info.durationInSec
                });
            } else if (type == 'yt_video') { // If the query is a youtube url.
                try {
                    const info = await play.video_info(query);
                    if (info) songInfo.push({
                        name: info.video_details.title,
                        url: info.video_details.url,
                        length: info.video_details.durationInSec
                    });
                } catch (error) {
                    if (error.message.includes('Sign in to confirm your age')) {
                        interaction.editReply('Sorry, youtube doesn\'t let me play age restricted videos.');
                        return;
                    } 
                }
            } else if (type == 'search') { // Assume it's a search query and not a url.
                const info = await play.search(query, {limit:1});
                if (info[0]) songInfo.push({
                    name: info[0].title,
                    url: info[0].url,
                    length: info[0].durationInSec
                });
            } else {
                interaction.editReply('Sorry, that type of link isn\'t supported yet!');
                return;
            }

            if (!songInfo[0]) { // If the song variable hasn't been changed.
                interaction.editReply('There was an error finding your song(s).');
                return;
            }

            // Loop through all of the the songs and play/queue them.
            let count = 0;
            let result = '';
            songInfo.forEach(songData => {
                const song = new Song(
                    songData.name, 
                    interaction.member, 
                    songData.url ? songData.url : null, 
                    songData.length ? songData.length : null
                );
                
                if (count == 0) result = await GuildPlayer.play(song);
                else await GuildPlayer.play(song);
                count ++;
            });

            if (songInfo.length > 1) result = `Added ${songInfo[0].name} and ${songInfo.length - 1} other songs to the queue.`;
            interaction.editReply(result);
        }
    }
}

