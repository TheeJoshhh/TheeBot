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

// Import required modules.
const Discord = require('discord.js');
const play = require('play-dl');
const { 
    joinVoiceChannel, 
    getVoiceConnection,
    VoiceConnectionStatus,
    entersState,
    createAudioResource,
    createAudioPlayer,
    NoSubscriberBehavior,
    AudioPlayerStatus,
} = require('@discordjs/voice');

const musicData = new Discord.Collection();

play.getFreeClientID().then((clientID) => play.setToken({
    soundcloud : {
        client_id : clientID
    }
}));

class MusicPlayer {
    constructor(guildId) {
        // If the object has already been created, return that.
        if (musicData.get(guildId)) return musicData.get(guildId);

        this.id = guildId; // Guild ID the MusicPlayer was made for.
        this.queue = []; // The song queue in the guild.
        this.repeat = false; // If the song will keep repeating.
        this.loop = false; // If songs go back to the end of the queue after playing.
        this.voiceId = null; // The ID of the connected voice channel.
        this.player = null; // The discord player object.
        this.controller = null; // Null or the ID of the guild.
        this.subscription = null;

        // Automatically store the music data to a collection for easy access.
        musicData.set(this.id, this);
    }

    destroy() {
        // If the bot has a voice connection, destroy it.
        const voiceConnection = getVoiceConnection(this.id);
        if (voiceConnection) voiceConnection.destroy();

        // If the bot has a player in the guild, stop it.
        if (this.player && this.controller == null) this.player.stop();

        // Remove all references to this object, deleting it.
        musicData.delete(this.id);
    }

    connect(voiceChannel) {
        let connection = getVoiceConnection(this.id);

        // If there's an existing voice connection, destroy it.
        if (connection) connection.destroy();

        try {
            // Create a voice connection in the given voice channel.
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
        } catch (e) { return e; }

        // Update MusicPlayer info.
        this.voiceId = voiceChannel.id;

        // Watch for disconnects.
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect.
            } catch (error) {
                // Seems to be a real disconnect, destroy the MusicPlayer.
                this.destroy();
            }
        });
    }

    createPlayer() {
        // If the player already exists, return.
        if (this.player) return;

        // Create an audio player.
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        this.player = player;
        const connection = getVoiceConnection(this.id);
        connection.subscribe(this.player);

        this.player.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
            this.next();
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.next();
        });
    }

    async play(songs) {
        if (!this.player) this.createPlayer();

        // Add the song(s) to the queue.
        songs.forEach(song => {
            this.queue.push(song);
        });

        // If the player is idle, play the first song, otherwise queue it.
        if (!this.queue.length <= songs.length) {
            try {
                const resource = await songs[0].getResource();
                this.player.play(resource);
                if (songs.length > 1) 
                return `Now playing \`${songs[0].name}\` and added \`${songs.length - 1}\` other songs to the queue.`;
                else return `Now playing \`${songs[0].name}\`.`;
            } catch (e) {
                this.queue.shift();
                return new Error(`There was an error playing \`${song.name}\`.`);
            }
        } else {
            if (songs.length > 1) 
            return `Added \`${songs.length}\` songs to the queue.`;
            else return `Added \`${songs[0].name}\` to the queue.`;
        }
        
    }

    async next() {
        // If loop is on, put the song to the back of the queue.
        if (this.loop) this.queue.push(this.queue[0]);
        // If repeat is off, shift the queue.
        if (!this.repeat) this.queue.shift();
        
        // If there are no more songs in queue, return.
        if (this.queue.length < 1) return;
        try {
            const resource = await this.queue[0].getResource();
            this.player.play(resource);
            return `Now Playing ${this.queue[0].name}`;
        } catch (e) {
            console.error(e)
            this.next();
        }
    }
}

class Song {
    constructor(name, member, url, length) {
        // Define initial values.
        this.name = name;
        this.voteSkip = [];
        this.queuedBy = {name: member.user.tag, id: member.user.id}

        // Set optional parameters to null.
        this.url = null;
        this.length = null;

        // If the optional parameters are supplied, use them.
        if (url) this.url = url;
        if (length) this.length = length;
    }

    /* 
    A method to query youtube for the song.
    Songs from spotify or from playlists won't have a
    url or length set until play time to prevent API spam.
    */
    async fetch() {
        // If the url isn't set, query youtube for the song.
        if (!this.url) {
            const songInfo = await play.search(this.name, { limit: 1 });
            if (songInfo) {
                this.name = songInfo[0].title;
                this.url = songInfo[0].url;
                this.length = songInfo[0].durationInSec;
            } else {
                return new Error('The song wasn\'t found.');
            }
        }
        return;
    }

    async getResource() {
        // If the song hasn't got a url set.
        if (!this.url) {
            try {
                await this.fetch();
            } catch (e) { return e; }
        }
        // If the song still doesn't have a url set, return an error.
        if (!this.url) return new Error('Couldn\'t play the song.');

        const stream = await play.stream(this.url) // This will create stream from the above search

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        return resource;
    }
}

module.exports.MusicPlayer = MusicPlayer;
module.exports.Song = Song;
module.exports.musicData = musicData;