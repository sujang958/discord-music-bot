const { MessageEmbed } = require('discord.js')
const util = require('util')

module.exports = {
  name: 'eval',
  aliases: ['evaluate', 'ㄷㅍ미', 'ㄷㅍ미ㅕㅁㅅㄷ', "이발"],

  async run (client, msg, args) {
    if (!client.devs.includes(msg.author.id)) return

    const str = args.join(' ')
    if (!str) return await msg.reply('실행할 코드를 입력해 주세요.')

    const m = await msg.reply('Evaling...')

    let result = ''
    const error = { occured: false, obj: null }
    let useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    try {
      const evaluated = await evaluate(msg, str)
      result = util.inspect(evaluated, { depth: 0 })
    } catch (err) {
      if (err instanceof Error) {
        result = err.message
        error.obj = err
      } else result = err

      error.occured = true
    }

    if (result.length > 1000) useEmbed = false
    const moreText = '\nAnd much more...'

    if (useEmbed) {
      const _str = str.length > 1000 ? str.slice(0, 1000) + moreText : str
      const embed = new MessageEmbed()
        .setTitle('코드 실행')
        .addField('입력', '```\n' + _str + '\n```')
        .addField('출력', '```\n' + result.replace(`${process.env.TOKEN}`, "TOP SECRET") + '\n```')
      embed.setColor(error.occured ? 'RED' : 'GREEN')

      return m.edit({ content: '', embed })
    } else {
      const _str = str.length > 150 ? str.slice(0, 150) + moreText : str
      const _result = result.length > 1750 ? result.slice(0, 1750) + moreText : result
      const print = '입력```\n' +
        _str + '\n```\n' +
        '출력```\n' +
        _result + '\n```'

      return m.edit(print)
    }
  }
}

async function evaluate (msg, code) {
    // Helpers
    /* eslint-disable no-unused-vars */
    const client = msg.client
    const guild = msg.guild
    const channel = msg.channel
    const author = msg.author
    const member = msg.member
    const Discord = require('discord.js')
    const childProcess = require('child_process')
    const fs = require('fs')
    const os = require('os')
    /* eslint-enable no-unused-vars */

    return new Promise((resolve, reject) => {
      let result
      try {
        // eslint-disable-next-line no-eval
        result = eval(code)
        resolve(result)
      } catch (err) { reject(err) }
    })
  }
