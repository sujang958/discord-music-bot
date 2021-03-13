require('dotenv').config();


module.exports = {
    name: "스킵",
    aliases: ["skip", '건너뛰기'],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args) {
        client.music.skip(client.queue, message);
    }
}