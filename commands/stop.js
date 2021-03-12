require('dotenv').config();


module.exports = {
    name: "정지",
    aliases: ["stop", "ㄴ새ㅔ"],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args) {
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');
        let queue = client.queue.get(`${message.guild.id}`);
        if (queue.musics.length <= 0) return message.reply('재생중인 음악이 없어요!');
        if (!queue.onListen)    return message.reply('재생중인 음악이 없어요!');

        client.music.stop(queue, message);
    }
}