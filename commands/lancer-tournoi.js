const Discord = require("discord.js")
const Sequelize = require("sequelize")
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
    bot.interval = null

    await message.deferReply({ ephemeral: true })

    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: args.get("tournament_id").value.split(" - ")[0] } })

    await require(`../events/.fetchBladersData.js`).run(bot, tournament)
    
    await checkMatches(bot, tournament.dataValues.tournament_challonge)
    bot.interval = setInterval(() => checkMatches(bot, tournament.dataValues.tournament_challonge), 1000 * 60 * 5)
    setTimeout(function () { clearInterval(bot.interval) }, 1000 * 3600 * 8)

    return await message.editReply({content: "Done.", ephemeral: true})
  }
}

async function checkMatches(bot, tournament_id) {

  let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' } 
  let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament_id + "/matches.json?community_id=sunafterthereign&per_page=300", requestOptions)
  let matches = await request.json()

  for (match of matches.data) {
    if (!bot.knownMatches.has(match.id)) bot.knownMatches.set(match.id, match)

    let oldMatch = bot.knownMatches.get(match.id)

    if (oldMatch.attributes.state != "complete" && match.attributes.state == "complete") {

      let participation1 = await bot.Participations.findOne({ where: { participation_id: match.attributes.points_by_participant[0].participant_id } })
      let participation2 = await bot.Participations.findOne({ where: { participation_id: match.attributes.points_by_participant[1].participant_id } })  

      let blader1 = await bot.Bladers.findOne({ where: { blader_username: participation1.dataValues.participation_username } })
      let blader2 = await bot.Bladers.findOne({ where: { blader_username: participation2.dataValues.participation_username } })

      bot.twitch_client.say(bot.twitch_channel, `${blader1.dataValues.blader_displayname} ${(match.attributes.scores == "" || match.attributes.scores == "0 - 0") ? match.attributes.points_by_participant[0].participant_id == match.attributes.winner_id ? "0-DQ" : "DQ-0" : match.attributes.scores.split(' ').join('')} ${blader2.dataValues.blader_displayname}`).catch(err => console.log(err))
      bot.knownMatches.set(match.id, match)
    }
  }
}


