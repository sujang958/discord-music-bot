const { MessageEmbed } = require('discord.js');

require('dotenv').config();


module.exports = {
    name: "핑",
    aliases: ['ping', 'ㅔㅑㅜㅎ'],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args = []) {
        let pingMsg = await message.channel.send('측정 중...');
        pingMsg.edit(new MessageEmbed().setAuthor('Ping').addField(`API Latency`, `${client.ws.ping} ms`).addField(`Latency`, `${Date.now() - pingMsg.createdTimestamp} ms`).setFooter(`${message.author.tag}`,  message.author.displayAvatarURL({dynamic: true})));
    }
}