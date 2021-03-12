require('dotenv').config();


module.exports = {
    name: "추가",
    aliases: ["add"],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args) {
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');

        client.music.add(client.queue, message, args);
    }
}