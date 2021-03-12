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
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');
        let queue = client.queue.get(`${message.guild.id}`);
        if (queue.musics.length <= 0) return message.reply('재생중인 음악이 없어요!');
        if (!queue.dispatcher)  return message.reply('재생중인 음악이 없어요!');

        if (queue.musics[0].user == message.author.id) {
            queue.dispatcher.end();
            return message.reply('스킵했어요!');    
        } else {
            let chkMsg = await message.channel.send('스킵 찬반 투표, 아래 이모지를 통화방의 모든 인원이 눌렀을때 스킵돼요!');
            chkMsg.react('✅');
            let memberCount = message.member.voice.channel.members.size;
            let memberArr = message.member.voice.channel.members.array();
            let userIDs = [];
            for (let i in memberArr) {
                userIDs.push(memberArr[i].id);
            }
            let collector = chkMsg.createReactionCollector((reaction, user) => reaction.emoji.name == "✅" &&  userIDs.includes(user.id), {tiem: 30000});

            collector.on('collect', reaction => {
                if (reaction.count == memberCount) {
                    message.channel.send('스킵했어요!');
                    return queue.dispatcher.end();
                }     
            });
        }
    }
}