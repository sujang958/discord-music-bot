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
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');
        let queue = client.queue.get(`${message.guild.id}`);
        if (queue.musics.length <= 0) return message.reply('재생중인 음악이 없어요!');
        if (!queue.dispatcher)  return message.reply('재생중인 음악이 없어요!');
        if (isNaN(args[0])) return message.reply('숫자를 입력해야돼요!');
        let volume = Number(args[0]);
        if (volume < 0.9 || volume > 100)   return message.reply('1 ~ 100을 입력해야돼요!');

        queue.dispatcher.setVolume(volume / 100);
        return message.reply('설정했어요!');
    }
}