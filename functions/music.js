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
        if (!queue.has(message.guild.id))   return message.reply('... **아무것도 없네요!**');
        let guildQueue = queue.get(message.guild.id);
        if (guildQueue.musics.length <= 0)   return message.reply('... **아무것도 없네요!**');
        guildQueue.onListen = true;

        let volume = 0;
        if (guildQueue.volume)
            volume = guildQueue.volume;
        else 
            volume = 50;

        let opusStream = await ytdl(guildQueue.musics[0].url);
        /**
         * @type {import('discord.js').StreamDispatcher}
         */
        guildQueue.dispatcher = guildQueue.connection.play(opusStream, {type: 'opus', volume: volume / 100});

        let embed = new MessageEmbed()
        .setTitle(`${guildQueue.musics[0].title}\u200b`)
        .setColor('GREEN')
        .setDescription(`음악을 재생할께요!`)
        .setTimestamp();
        message.channel.send(embed);

        guildQueue.dispatcher.on('finish', () => {
            if (!guildQueue.loop)
                guildQueue.musics.shift();
            else
                guildQueue.musics.push(guildQueue.musics.shift());

            console.log('end');
            if (guildQueue.musics[0]) {
                this.play(queue, message);
            } else {
                guildQueue.vChannel.channel.leave();
                guildQueue.dispatcher.destroy();
                guildQueue.musics = [];
                guildQueue.dispatcher = null;
                guildQueue.connection = null;
                guildQueue.onListen = false;
                guildQueue.vChannel = null;
                guildQueue.volume = null;
                return message.channel.send('모든 음악을 재생했어요! 그러면 이제 가볼께요!');
            }
        });
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
                vChannel: null,
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
            queue.volume = null;
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
                    queue.vChannel = null;
                    queue.volume = null;
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
                embedJSON.description = `현재 재생 노래: ${queue.musics[0].title}`
            }
            var username = message.guild.members.cache.get(`${queue.musics[0].user}`);
            username = username.user.username;
            embedJSON.fields.push({
                name: `${queue.musics[i].title}`,
                value: `신청자: ${username}`
            });
        }
        
        message.reply({embed: embedJSON});
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async skip(queue, message) {
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');
        if (!queue.has(message.guild.id)) return message.reply('재생중인 음악이 없어요!');
        queue = queue.get(`${message.guild.id}`);
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
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async volume(queue, message, args) {
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');
        if (!queue.has(message.guild.id)) return message.reply('재생중인 음악이 없어요!');
        queue = queue.get(`${message.guild.id}`);
        if (!queue.musics) return message.reply('재생중인 음악이 없어요!');
        if (queue.musics.length <= 0) return message.reply('재생중인 음악이 없어요!');
        if (!queue.dispatcher)  return message.reply('재생중인 음악이 없어요!');
        if (isNaN(args[0])) return message.reply('숫자를 입력해야돼요!');
        let volume = Number(args[0]);
        if (volume < 0.9 || volume > 100)   return message.reply('1 ~ 100을 입력해야돼요!');

        queue.volume = volume;
        queue.dispatcher.setVolume(volume / 100);
        return message.reply('설정했어요!');
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async resume(queue, message) {
        if (!message.member.voice)  return message.reply('음성채널에 들어가있어야 해요!');
        if (!queue.has(message.guild.id))
            return message.reply('... **아무것도 없네요!**');
        queue = queue.get(message.guild.id);
        if (queue.musics.length <= 0) return message.reply('재생중인 음악이 없어요!');
        if (!queue.dispatcher)  return message.reply('재생중인 음악이 없어요!');
        if (!queue.dispatcher.paused) return message.reply('이미 재생중이에요!');
        
        queue.dispatcher.resume();
        message.reply('노래를 재생할께요!');
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async shuffle(queue, message) {
        if (!queue.has(message.guild.id))
            return message.reply('... **아무것도 없네요!**');
        queue = queue.get(message.guild.id);
        if (!queue.musics)
            return message.reply('... **아무것도 없네요!**');
        if (queue.musics.length <= 1)
            return message.reply('대기열에 추가된 노래가 2개 이상이여야 해요!');
        if (!queue.dispatcher)
            return message.reply('재생중인 노래가 없네요!');
        if (!message.member.hasPermission('ADMINISTRATOR'))
            return message.reply('관리자 권한이 있어야해요...');

        queue.musics = shuffle(queue.musics);
        queue.dispatcher.end();
        message.reply('섞었어요!');
    },
    /**
     * @param {Map} queue 
     * @param {import('discord.js').Message} message 
     */
    async loop(queue, message) {
        if (!queue.has(message.guild.id))
            return message.reply('... **아무것도 없네요!**');
        queue = queue.get(message.guild.id);
        if (!queue.musics)
            return message.reply('... **아무것도 없네요!**');
        if (!queue.dispatcher)
            return message.reply('재생중인 노래가 없네요!');
        if (queue.hasOwnProperty('loop'))
            if (queue.loop)
                return message.reply('이미 반복중인데에?');

        queue.loop = true;
        message.reply('대기열에 추가된 노래들을 반복할께요!');
    }
}

/**
 * @breif Shuffle Array
 * @param {Array} array 
 * @returns {Array} array
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}