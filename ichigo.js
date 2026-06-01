const Discord = require("discord.js")
const config = require("./config.json")
const tmi = require('tmi.js')
const fs = require("fs")

const bot = new Discord.Client({intents: 3276799})

bot.color = "E54D00"
bot.season = "3"

bot.challonge = config.challonge
bot.top_bladers = config.top_bladers

bot.twitch_client = new tmi.client({ identity: { username: config.channel, password: "oauth:" + config.twitch }, channels: [config.channel] }).connect()

fs.readdirSync("./events/").filter(file => file.endsWith(".js") && !file.startsWith('.')).forEach(async event_file => bot.on(event_file.split(".js").join(""), require(`./events/${event_file}`).bind(null, bot)))

bot.login(config.token)