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
        let queue = client.queue.get(`${message.guild.id}`);
        
        if (queue.onListen)   return message.reply('이미 재생중이에요!');
        if (queue.musics.length <= 0)    return message.reply('추가된 음악이 없어요!');

        message.member.voice.channel.join().then(
            async connection => {
                queue.connection = connection;
                queue.vChannel = message.member.voice;
                client.music.play(queue, message);
            }
        );
    }
}