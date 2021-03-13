require('dotenv').config();


module.exports = {
    name: "재생",
    aliases: ["play"],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args) {
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');
        if (!client.queue.has(message.guild.id))    return message.reply('... **아무것도 없네요!**');
        message.member.voice.channel.join().then(
            async connection => {
                let queue = client.queue.get(message.guild.id);
                queue.connection = connection;
                queue.vChannel = message.member.voice;
                client.music.play(client.queue, message);
            }
        );
    }
}