const Discord = require("discord.js")
const tmi = require('tmi.js')
const fs = require("fs")

const config = require("./config.json")

const bot = new Discord.Client({intents: 3276799})

bot.color = "E54D00"
bot.season = "3"

bot.challonge = config.challonge
bot.myHeaders = new Headers({ Accept: "application/json", "Authorization-Type": "v1", Authorization: bot.challonge, "Content-Type": "application/vnd.api+json" })

bot.top_bladers = config.top_bladers

bot.twitch_channel = config.channel
bot.twitch_client = new tmi.Client({ identity: { username: bot.twitch_channel, password: "oauth:" + config.twitch }, channels: [bot.twitch_channel] })
bot.twitch_client.connect().then(() => console.log("Twitch client connected as \"" + bot.twitch_channel + "\".")).catch(err => console.log("Twitch client error : " + err))

fs.readdirSync("./events/").filter(file => file.endsWith(".js") && !file.startsWith('.')).forEach(async event_file => bot.on(event_file.split(".js").join(""), require(`./events/${event_file}`).bind(null, bot)))

bot.login(config.token)