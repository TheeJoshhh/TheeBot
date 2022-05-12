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
const fs = require('fs');
const Moderators = require('./schemas/moderator');

// Export utils.
module.exports.getFiles = getFiles;
module.exports.checkMod = checkMod;

// Returns all files from a given directory and all sub-directories.
function getFiles(dir) {
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });
    let commandFiles = [];

    for (const file of files) {
        if (file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`, '.js')
            ]
        } else if (file.name.endsWith('.js')) {
            commandFiles.push(`${dir}/${file.name}`);
        }
    }
    return commandFiles;
}

function checkMod(member) {
    if (member.permissions.has('MODERATE_MEMBERS')) return true;
    const mod_data = Moderators.findOne({ _id: member.guild.id });
    if (mod_data) {
        if (mod_data.users.includes(member.user.id)) return true;
        for (x = 0; x < mod_data.roles.length; x++) {
            if (member.roles.cache.includes(mod_data.roles[x])) return true;
        }
    }
    return false;
}