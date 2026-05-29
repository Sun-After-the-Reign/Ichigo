const Discord = require("discord.js")
const config = require("./config.json")
const tmi = require('tmi.js')
const fs = require("fs")
const { request } = require('undici')

const bot = new Discord.Client({intents: 3276799})

bot.color = "E54D00"
bot.url = "https://discord.gg/afEvCBF9XR"

bot.challonge = config.challonge
bot.top_bladers = config.top_bladers

bot.season = "3"

bot.suivi = "none"
bot.knownMatches = new Map()
bot.participants = new Map()
bot.interval = null

fs.readdirSync("./events/").filter(file => file.endsWith(".js") && !file.startsWith('.')).forEach(async event_file => bot.on(event_file.split(".js").join(""), require(`./events/${event_file}`).bind(null, bot)))

bot.login(config.token)

bot.twitch_client = new tmi.client({ identity: { username: "sunafterthereign", password: "oauth:" + config.twitch }, channels: ["sunafterthereign"] })
bot.twitch_client.connect()

async function checkMatches() {

  if (bot.suivi == "none") return

  let req = await request(`https://api.challonge.com/v1/tournaments/${bot.suivi}/matches.json?api_key=${bot.challonge}`)
  let currentMatches = await req.body.json()

  currentMatches.forEach(item => {
    let match = item.match

    if (!bot.knownMatches.has(match.id)) {
      bot.knownMatches.set(match.id, match)
      return
    }

    let oldMatch = bot.knownMatches.get(match.id)

    if (oldMatch.state != "complete" && match.state == "complete") { bot.twitch_client.say("sunafterthereign", `${bot.participants.get(match.winner_id)} 4-${Math.min(...match.scores_csv.split("-").map(Number))} ${bot.participants.get(match.loser_id)}`).catch(err => console.log(err)) }

    bot.knownMatches.set(match.id, match)
  })
}
 
bot.on("check", () => { 
  checkMatches()
  bot.interval = setInterval(checkMatches, 1000 * 60 * 5) 
})
setTimeout(function () { clearInterval(bot.interval) }, 1000 * 3600 * 8)
