require('dotenv').config();


module.exports = {
    name: "다시재생",
    aliases: ["resume", "ㄱㄷ녀ㅡㄷ"],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args) {
        client.music.resume(client.queue, message);
    }
}