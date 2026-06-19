const Discord = require("discord.js")
const Sequelize = require("sequelize")
const { google } = require("googleapis")
const { request } = require('undici')

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
      required: false,
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

    const auth = new google.auth.GoogleAuth({ keyFile: "./google.json", scopes: ["https://www.googleapis.com/auth/spreadsheets"] })

    let values
    let all_values = []
    
    let tournaments_paris_bdd = await bot.Tournaments.findAll({ where: { tournament_name: { [Sequelize.Op.startsWith]: "Beyblade Battle Tournament" }, tournament_place: { [Sequelize.Op.endsWith]: "paris" }, tournament_ruleset: "3on3", tournament_season: bot.season, tournament_status: "Tournoi fini" } })
    let tournaments_marseille_bdd = await bot.Tournaments.findAll({ where: { tournament_name: { [Sequelize.Op.startsWith]: "Beyblade Battle Tournament" }, tournament_place: { [Sequelize.Op.endsWith]: "marseille" }, tournament_ruleset: "3on3", tournament_season: bot.season, tournament_status: "Tournoi fini" } })
    
    let classement_paris = await computeRanking(bot, tournaments_paris_bdd)
    let classement_marseille = await computeRanking(bot, tournaments_marseille_bdd)

    let classements = [[classement_paris, "Paris"], [classement_marseille, "Marseille"]]

    if (args.get("send_message")) await message.channel.send("## Classement en cours - Saison " + bot.season + "\n-# https://docs.google.com/spreadsheets/d/e/2PACX-1vR3SoKvCW1BTnWs4ikQdlMxYDSOlUlEeeb_Qi0RpQoKSZG1dfEVluU3uj5LzLvwhKdRZh9IA4V8qa89/pubhtml")

    await cleanRanking(bot, auth, 20, "RAW!A2")

    for (classement of classements) {
      
      values = []

      await cleanRanking(bot, auth, 7, `${classement[1]}!B2`)
      /*
     let msg = "## TOP 10 " + classement[1] + " au " + new Date().toLocaleDateString("fr-FR") + "\n-# Classement par score calculé sur l'ensemble des matchs de 3on3.\n```\n N°         NOM          SCORE    WIN\n\n"
      for (blader in classement[0].slice(0, 10)) {
        msg += ' '.repeat(3 - ((parseInt(blader) + 1).toString()).length) + (parseInt(blader) + 1).toString() + ' '.repeat(4) + classement[0][blader][0] + ' '.repeat(18 - classement[0][blader][0].length) + classement[0][blader][1] + ' '.repeat(5) + classement[0][blader][3]["wins"] + "\n"
      }
      msg += "```"
      if (args.get("send_message")) await message.channel.send(msg)
      */
      for (blader of classement[0]){

        if (blader["username"]){ 
          values.push([
            blader["name"], 
            blader["clan"], 
            blader["score"], 
            blader["trophies"], 
            blader["participations"], 
            blader["winrate"], 
            blader["point_avg"]
          ])
        }
      }
      await publishRanking(bot, auth, values, `${classement[1]}!B2`)
    }
    
    return await message.editReply({ content: "Done.", ephemeral: true })
  }
}

async function computeRanking(bot, tournaments) {

  let rankingData = {}

  for (tournament of tournaments) {

    let request
    let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' } 

    request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/matches.json?community_id=sunafterthereign", requestOptions)
    let matches = await request.json()

    request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?community_id=sunafterthereign&per_page=200", requestOptions)
    let raw_participants = await request.json()
    let participants = { data: raw_participants.data.filter(p => p.attributes.username && p.attributes.final_rank)}

    for (participant of participants.data) {

        if (rankingData[participant.attributes.username]) {
          rankingData[participant.attributes.username]["participations"] += 1
        } else {
          rankingData[participant.attributes.username] = {
            username: participant.attributes.username,
            name: participant.attributes.name.includes(" | ") ? participant.attributes.name.split(" | ")[1] : participant.attributes.name,
            clan: participant.attributes.name.includes(" | ") ? participant.attributes.name.split(" | ")[0] : "",
            participations: 1,
            trophies: 0,
            W: 0,
            L: 0,
            winpoints: 0,
            lostpoints: 0,
          }
        } if (participant.attributes.final_rank == 1) rankingData[participant.attributes.username]["trophies"] += 1
    }
 
    for (match of matches.data) {

      for (blader of match.attributes.points_by_participant) {

        if (!participants.data.find(p => p.id == blader.participant_id)) break
            
        if ((match.attributes.winner_id == blader.participant_id) && (match.attributes.scores != "0 - 0")) {
          rankingData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["W"] += 1
          rankingData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["winpoints"] += 4
        } else if ((match.attributes.winner_id != blader.participant_id) && (match.attributes.scores != "0 - 0")) {
          rankingData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["L"] += 1
          rankingData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["lostpoints"] += blader.scores[0]
        } else if ((match.attributes.winner_id != blader.participant_id) && (match.attributes.scores == "0 - 0")) rankingData[participants.data.find(p => p.id == blader.participant_id).attributes.username]["L"] += 1
      }
    }
  }
  
  var ranking = await Object.keys(rankingData).map((blader) => { return require(`../events/.secretFormula.js`).run(rankingData, blader, tournaments.length) })
  return ranking.sort(function (a, b) { return a["score"] != b["score"] ? b["score"] - a["score"] : a["participations"] != b["participations"] ? b["participations"] - a["participations"] : b["username"] - a["username"] })
}

async function cleanRanking(bot, auth, width, range) {
  let values = new Array(300).fill(new Array(width).fill(""))
  await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: range, valueInputOption: "USER_ENTERED", resource: { values } })
}

async function publishRanking(bot, auth, values, range) {
  await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: range, valueInputOption: "USER_ENTERED", resource: { values } })
}
