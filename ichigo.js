const Discord = require("discord.js")
const config = require("./config.json")
const tmi = require('tmi.js')
const fs = require("fs")

const bot = new Discord.Client({intents: 3276799})

bot.color = "E54D00"
bot.url = "https://discord.gg/afEvCBF9XR"

bot.challonge = config.challonge
bot.top_bladers = config.top_bladers

bot.twitch_client = new tmi.client({ identity: { username: "sunafterthereign", password: "oauth:" + config.twitch }, channels: ["sunafterthereign"] }).connect()

fs.readdirSync("./events/").filter(file => file.endsWith(".js") && !file.startsWith('.')).forEach(async event_file => bot.on(event_file.split(".js").join(""), require(`./events/${event_file}`).bind(null, bot)))

bot.login(config.token)