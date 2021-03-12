let ytdl = require('ytdl-core-discord');
const { MessageEmbed } = require('discord.js');
const youtubeSearch = require('scrape-youtube').default;
const search = require('youtube-search');
const queue = require('../commands/queue');
require('dotenv').config();


module.exports = {
    /**
     * @param {Map} queue 
     * @param {String} url 
     * @param {import('discord.js').Message} message 
     */
    async play(queue, message) {
        queue.onListen = true;
        let opusStream = await ytdl(queue.musics[0].url);
        let dispatcher = queue.connection.play(opusStream, {type: 'opus'});

        let embed = new MessageEmbed()
        .setTitle(`${queue.musics[0].title}\u200b`)
        .setColor('GREEN')
        .setDescription(`음악을 재생할께요!`)
        .setTimestamp();
        message.channel.send(embed);

        dispatcher.on('finish', () => {
            queue.musics.shift();
            console.log('end');
            if (queue.musics[0]) {
                this.play(queue, message);
            } else {
                queue.vChannel.channel.leave();
                queue.dispatcher.destroy();
                queue.musics = [];
                queue.dispatcher = null;
                queue.connection = null;
                queue.onListen = false;
                return message.channel.send('모든 음악을 재생했어요! 그러면 이제 가볼께요!');
            }
        });

        queue.dispatcher = dispatcher;
    },
    /**
     * 
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     * @param {Array} args
     */
    async add(queue, message, args) {
        search(args.join(' '), {maxResults: 1, key: process.env.YOUTUBE_KEY, type: 'video'}, async (err, result) => {
            if (err)    throw err;
            if (result.length <= 0) return message.reply('검색결과가 없습니다!');
            if (!queue.get(`${message.guild.id}`)) queue.set(`${message.guild.id}`, {
                musics: [],
                connection: null,
                dispatcher: null,
            });

            queue = queue.get(`${message.guild.id}`);
            queue.musics.push({
                title: `${result[0].title}`,
                user: message.author.id,
                url: `${result[0].link}`
            });

            let embed = new MessageEmbed()
            .setTitle(`${result[0].title}`)
            .setDescription(`노래를 추가했어요!`)
            .setColor('GREEN')
            .setThumbnail(result[0].thumbnails.high.url);

            return message.reply(embed);
        });
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async stop(queue, message) {
        if (queue.musics[0].user == message.author.id) {
            queue.vChannel.channel.leave();
            queue.dispatcher.destroy();
            queue.musics = [];
            queue.dispatcher = null;
            queue.connection = null;
            queue.onListen = false;
            queue.vChannel = null;
            return message.reply('음악을 정지하고 대기열을 초기화 했어요!');
        } else {
            let memberCount = message.member.voice.channel.members.size;
            memberCount = Math.ceil(memberCount / 2);
            let chkMsg = await message.channel.send(`정지 찬반 투표, 아래 이모지를 통화방의 ${memberCount} 명이 눌렀을때 정지돼요!`);
            chkMsg.react('✅');
            
            let memberArr = message.member.voice.channel.members.array();
            let userIDs = [];
            for (let i in memberArr) {
                userIDs.push(memberArr[i].id);
            }
            let collector = chkMsg.createReactionCollector((reaction, user) => reaction.emoji.name == "✅" &&  userIDs.includes(user.id), {tiem: 30000});

            collector.on('collect', reaction => {
                if (reaction.count == memberCount) {
                    message.member.voice.channel.leave();
                    queue.dispatcher.destroy();
                    queue.musics = [];
                    queue.dispatcher = null;
                    queue.connection = null;
                    queue.onListen = false;
                    return message.reply('음악을 정지하고 대기열을 초기화 했어요!');
                }     
            });
        }
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async playlist(queue, message, args) {
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');

        youtubeSearch.search(args.join(' '), {type: 'playlist'}).then(r => {
            if (r.playlists.length <= 0)    throw new Error('No Search Results found :(');
            if (r.playlists[0].videos.length <= 0)  throw new Error('No Search Results found :(');
            if (!queue.get(`${message.guild.id}`)) queue.set(`${message.guild.id}`, {
                musics: [],
                connection: null,
                dispatcher: null,
            });
            queue = queue.get(`${message.guild.id}`);

            for (let i in r.playlists[0].videos) {
                queue.musics.push({
                    title: `${r.playlists[0].videos[i].title}`,
                    user: message.author.id,
                    url: `${r.playlists[0].videos[i].link}`,
                });
            }

            let embed = new MessageEmbed()
            .setTitle(`${r.playlists[0].title}`)
            .setDescription(`${r.playlists[0].videos.length} 개의 노래를 추가했어요!`)
            .setColor('GREEN')
            .setThumbnail(r.playlists[0].thumbnail);

            return message.reply(embed);
        }).catch(err => {
            console.log(err);
            return message.reply('이런! 뭔가 잘못됬어요, 검색결과가 없거나 플레이리스트에 음악이 없는거 아닐까요?');
        });
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async queue(queue, message) {
        if (!queue.has(message.guild.id)) return message.reply('아직 대기열에 아무것도 없어요!');
        if (queue.get(message.guild.id).musics.length <= 0) return message.reply('아직 대기열에 아무것도 없어요!');

        queue = queue.get(message.guild.id);
        let embedJSON = {
            title: '현재 노래 대기열',
            color: 'GREEN',
            timestamp: new Date(),
            footer: `${message.author.tag}\u200b`,
            fields: [],
        }
        for (let i in queue.musics) {
            if (queue.dispatcher) {
                embedJSON.description = `현재 재생 노래: ${queue.musics[0].title.slice(0, 20)}...`
            }
            var username = message.guild.members.cache.get(`${queue.musics[0].user}`);
            username = username.user.username;
            embedJSON.fields.push({
                name: `${queue.musics[i].title.slice(0, 20)}`,
                value: `신청자: ${username}`
            });
        }
        
        message.reply({embed: embedJSON});
    }
}