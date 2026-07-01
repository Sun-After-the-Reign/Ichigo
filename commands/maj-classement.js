const Discord = require("discord.js")
const Sequelize = require("sequelize")
const { google } = require("googleapis")

module.exports = {

  name: "maj-classement",
  description: "Mets à jour le classement",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Classement",
  options: [
    {
      type: "string",
      name: "organization",
      description: "Organization to update the ranking for",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "send_message",
      description: "Option to send ranking messages",
      required: false,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {

    await message.deferReply({ ephemeral: true })

    const module = await import(`../options/${args.get("organization").value}.js`)

    const auth = await module.getAuth()
    
    let tournaments = await module.getTournaments(bot)
    
    await populateParticipants(bot, tournaments)

    let performanceData = await fetchPerformanceData(bot, tournaments)

    let classement = await module.computeRanking(bot, performanceData, tournaments.length)    
    if (args.get("send_message")) await module.publishTop(bot, classement, message, tournaments)

    await cleanRanking(bot, auth, module.baseSize, `${module.sheet}!B2`)
    await cleanRanking(bot, auth, module.rawSize, `RAW ${module.sheet}!A2`)

    let values = await module.getValues(bot, classement, "base")
    let all_values = await module.getValues(bot, classement, tournaments.length)
    await publishRanking(bot, auth, values, `${module.sheet}!B2`)
    await publishRanking(bot, auth, all_values, `RAW ${module.sheet}!A2`)

    return await message.editReply({ content: "Done.", ephemeral: true })
  }
}

async function populateParticipants(bot, tournaments) {
  for (tournament of tournaments) await require(`../events/.fetchBladersData.js`).run(bot, tournament)
}

async function fetchPerformanceData(bot, tournaments) {
  let performanceData = {}

  for (tournament of tournaments) {

    let request
    let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' } 

    request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/matches.json?community_id=sunafterthereign", requestOptions)
    let matches = await request.json()

    request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?community_id=sunafterthereign&per_page=200", requestOptions)
    let raw_participants = await request.json()
    let participants = { data: raw_participants.data.filter(p => p.attributes.username && p.attributes.final_rank)}

    for (participant of participants.data) {

        if (performanceData[participant.attributes.username]) {
          performanceData[participant.attributes.username]["participations"] += 1
        } else {
          performanceData[participant.attributes.username] = {
            username: participant.attributes.username,
            participations: 1,
            trophies: 0,
            W: 0,
            L: 0,
            points: 0,
          }
        } if (participant.attributes.final_rank == 1) performanceData[participant.attributes.username]["trophies"] += 1
    }
 
    for (match of matches.data) {

      for (blader of match.attributes.points_by_participant) {

        if (!participants.data.find(p => p.id == blader.participant_id)) break
            
        if ((match.attributes.winner_id == blader.participant_id) && (match.attributes.scores != "0 - 0")) {
          performanceData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["W"] += 1
          performanceData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["points"] += 4
        } else if ((match.attributes.winner_id != blader.participant_id) && (match.attributes.scores != "0 - 0")) {
          performanceData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["L"] += 1
          performanceData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["points"] += blader.scores[0]
        } else if ((match.attributes.winner_id != blader.participant_id) && (match.attributes.scores == "0 - 0")) performanceData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["L"] += 1
      }
    }
  }

  return performanceData
  
  //var ranking = await Object.keys(performanceData).map((blader) => { return require(`../events/.secretFormula.js`).run(performanceData, blader, tournaments.length) })
  //return ranking.sort(function (a, b) { return a["score"] != b["score"] ? b["score"] - a["score"] : a["participations"] != b["participations"] ? b["participations"] - a["participations"] : b["username"] - a["username"] })
}

async function cleanRanking(bot, auth, width, range) {
  let values = new Array(300).fill(new Array(width).fill(""))
  await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: range, valueInputOption: "USER_ENTERED", resource: { values } })
}

async function publishRanking(bot, auth, values, range) {
  await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: range, valueInputOption: "USER_ENTERED", resource: { values } })
}
