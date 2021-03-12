require('dotenv').config();


module.exports = {
    name: "플레이리스트",
    aliases: ["playlist", "ㅔㅣ묘ㅣㅑㄴㅅ"],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args) {
        client.music.playlist(client.queue, message, args);
    }
}