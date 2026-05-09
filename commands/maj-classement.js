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
      name: "send_message",
      description: "Option to send ranking messages",
      required: false,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {

    // await message.channel.messages.delete(message.channel.lastMessageId)
    // await message.channel.messages.delete(message.channel.lastMessageId)
    // await message.channel.messages.delete(message.channel.lastMessageId)

    await message.deferReply({ ephemeral: true })

    const auth = new google.auth.GoogleAuth({ keyFile: "./google.json", scopes: ["https://www.googleapis.com/auth/spreadsheets"] })

    let values = []
    let all_values = []
    
    let tournaments_paris_bdd = await bot.Tournaments.findAll({ where: { tournament_name: { [Sequelize.Op.startsWith]: "Beyblade Battle Tournament" }, tournament_place: { [Sequelize.Op.endsWith]: "paris" }, tournament_ruleset: "3on3", tournament_season: bot.season, tournament_status: "Tournoi fini" } })
    let tournaments_marseille_bdd = await bot.Tournaments.findAll({ where: { tournament_name: { [Sequelize.Op.startsWith]: "Beyblade Battle Tournament" }, tournament_place: { [Sequelize.Op.endsWith]: "marseille" }, tournament_ruleset: "3on3", tournament_season: bot.season, tournament_status: "Tournoi fini" } })
    
    let classement_paris = await require("../events/.computeRanking.js").run(bot, tournaments_paris_bdd)
    let classement_marseille = await require("../events/.computeRanking.js").run(bot, tournaments_marseille_bdd)

    let classements = [[classement_paris, "Paris"], [classement_marseille, "Marseille"]]

    if (args.get("send_message")) await message.channel.send("## Classement en cours - Saison " + bot.season + "\n-# https://docs.google.com/spreadsheets/d/e/2PACX-1vR3SoKvCW1BTnWs4ikQdlMxYDSOlUlEeeb_Qi0RpQoKSZG1dfEVluU3uj5LzLvwhKdRZh9IA4V8qa89/pubhtml")

    values = new Array(300).fill(new Array(14).fill(""))
    await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: `RAW!A2`, valueInputOption: "USER_ENTERED", resource: { values } })

    for (classement of classements) {

      values = new Array(300).fill(new Array(6).fill(""))
      await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: `${classement[1]}!B2`, valueInputOption: "USER_ENTERED", resource: { values } })
      values = []
      
      res = "## TOP 10 " + classement[1] + " au " + new Date().toLocaleDateString("fr-FR") + "\n-# Classement par score calculé sur l'ensemble des matchs de 3on3.\n```\n N°         NOM          SCORE    WIN\n\n"
      for (blader in classement[0].slice(0, 10)) {
        res += ' '.repeat(3 - ((parseInt(blader) + 1).toString()).length) + (parseInt(blader) + 1).toString() + ' '.repeat(4) + classement[0][blader][0] + ' '.repeat(18 - classement[0][blader][0].length) + classement[0][blader][1] + ' '.repeat(5) + classement[0][blader][3]["wins"] + "\n"
      }
      res += "```"
      if (args.get("send_message")) await message.channel.send(res)

      for (blader in classement[0]) values.push([classement[0][blader][0], classement[0][blader][1], classement[0][blader][3]["wins"], classement[0][blader][3]["participations"], classement[0][blader][3]["W"] / (classement[0][blader][3]["W"] + classement[0][blader][3]["L"]), classement[0][blader][2]])
      for (blader in classement[0]) all_values.push([`[${classement[1][0]}]`,classement[0][blader][0],classement[0][blader][1],`=$M${all_values.length+2}*$N${all_values.length+2}*100000`,classement[0][blader][3]["wins"],classement[0][blader][3]["participations"],`=$H${all_values.length+2}/($H${all_values.length+2}+$I${all_values.length+2})`,classement[0][blader][3]["W"],classement[0][blader][3]["L"],`=$H${all_values.length+2}+$I${all_values.length+2}`,`=L${all_values.length+2}/$J${all_values.length+2}`,classement[0][blader][3]["points"],`=$G${all_values.length+2}+($K${all_values.length+2}/100)`,`=IF($L${all_values.length+2}>0;1/(1+(FLOOR(${classement[1] == "Paris" ? tournaments_paris_bdd.length : tournaments_marseille_bdd.length}/1,25)+2)*(1/($F${all_values.length+2}*$K${all_values.length+2})));0)`]) 
      await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: `${classement[1]}!B2`, valueInputOption: "USER_ENTERED", resource: { values } })

    }
    values = all_values
    await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: bot.top_bladers, range: `RAW!A2`, valueInputOption: "USER_ENTERED", resource: { values } })
    return await message.editReply({ content: "Done.", ephemeral: true })
  }
}
