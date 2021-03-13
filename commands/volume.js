require('dotenv').config();


module.exports = {
    name: "볼륨",
    aliases: ["volume", "패ㅣㅕㅡㄷ"],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args) {
        client.music.volume(client.queue, message, args);
    }
}