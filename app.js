// Dependencies
const music = require('./functions/music');
const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const Cryptr = require('cryptr');
const MongoDB = require('mongodb');

// Variables
dotenv.config();

// App
const client = new Discord.Client();
const cryptr = new Cryptr(process.env.asdf);
const db = MongoDB.MongoClient(`mongodb+srv://dbuser:${cryptr.decrypt(process.env.DBPW)}@cluster0.dlgbv.mongodb.net/music?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
client.db = {};
db.connect().then(async () => {
    client.db.music = db.db("music").collection("music");
});

// App Setting
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.queue = new Map();
client.music = music;
client.devs = process.env.DEVS.split(',');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Set bot command
const tableData = [];
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);

        for (const alias of command.aliases) {
            client.aliases.set(alias, command.name);
        }
        tableData.push({
            status: "✅",
            name: command.name,
            error: "null",
        });

        continue;
    } catch (e) {
        try {
            tableData.push({
                status: "❌",
                name: command.name,
                error: e.toString(),
            });
        } catch (error) {
            tableData.push({
                status: "❌",
                name: undefined,
                error: e.toString(),
            });
        }
        continue;
    }
}
console.table(tableData);


client.on("ready", () => {
    console.log(`${client.user.tag} 에 로그인됨`);
    client.user.setActivity('안녕하세요!');
});

client.once("reconnecting", () => {
    client.user.setActivity('다시 연결하는 중')
    console.log("reconnecting");
});

client.once("disconnect", () => {
    client.user.setActivity('Disconnect')
    console.log("disconnecting");
});


client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.mentions.has(client.user)) client.commands.get('도움').run(client, message);
    if (!message.content.startsWith(process.env.PREFIX)) return;

    const args = message.content.slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;
    
    let command = client.commands.get(cmd);
    let aliasesCommand = client.aliases.get(cmd);
    if (command) {
        command.run(client, message, args);
    } else if (aliasesCommand) {
        client.commands.get(aliasesCommand).run(client, message, args);
    }
})

client.login(cryptr.decrypt(process.env.TOKEN));