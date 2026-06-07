const Discord = require("discord.js")
const { request } = require('undici')

module.exports = {

  name: "lancer-tournoi",
  description: "Lance un tournoi sur Twitch",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: false,
  category: "Tournoi",
  options: [
    {
      type: "string",
      name: "tournament_id",
      description: "The tournament id to start",
      required: true,
      autocomplete: true,
    },
  ],

  async run(bot, message, args) {

    bot.knownMatches = new Map()
    bot.participants = new Map()
    bot.interval = null

    await message.deferReply({ ephemeral: true })

    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: args.get("tournament_id").value.split(" - ")[0] } })
    
    let req = await request(`https://api.challonge.com/v1/tournaments/${tournament.dataValues.tournament_challonge}/participants.json?api_key=${bot.challonge}`)
    let participants = await req.body.json()

    await participants.forEach(item => { bot.participants.set(item.participant.id, item.participant.name) })

    await checkMatches(bot, tournament.dataValues.tournament_challonge)
    bot.interval = setInterval(() => checkMatches(bot, tournament.dataValues.tournament_challonge), 1000 * 60 * 5)
    setTimeout(function () { clearInterval(bot.interval) }, 1000 * 3600 * 8)

    return await message.editReply({content: "Done.", ephemeral: true})
  }
}

async function checkMatches(bot, tournament_id) {

  let req = await request(`https://api.challonge.com/v1/tournaments/${tournament_id}/matches.json?api_key=${bot.challonge}`)
  let currentMatches = await req.body.json()

  currentMatches.forEach(item => {
    let match = item.match

    if (!bot.knownMatches.has(match.id)) {
      bot.knownMatches.set(match.id, match)
      return
    }

    let oldMatch = bot.knownMatches.get(match.id)
    if (oldMatch.state != "complete" && match.state == "complete") { 
      bot.twitch_client.say(bot.twitch_channel, `${bot.participants.get(match.player1_id)} ${(match.scores_csv == "" || match.scores_csv == "0-0") ? match.player1_id == match.winner_id ? "0-DQ" : "DQ-0" : match.scores_csv} ${bot.participants.get(match.player2_id)}`).catch(err => console.log(err))
      bot.knownMatches.set(match.id, match)
    }
  })
}
