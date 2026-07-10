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
    {
      type: "string",
      name: "add_tournament",
      description: "Option to add tournaments to the ranking",
      required: false,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {

    await message.deferReply({ ephemeral: true })

    if (args.get("add_tournament")){

      for (let tournament of args.get("add_tournament").value.split(",")) {
        let tournament_id = tournament

        let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' }
        let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament_id + ".json?community_id=" + args.get("organization").value, requestOptions)
        let challonge = await request.json()

        await bot.Tournaments.upsert({
          tournament_id: tournament_id,
          tournament_organization: args.get("organization").value,
          tournament_name: challonge.data.attributes.name,
          tournament_challonge: challonge.data.id,
        }, { where: { tournament_id: tournament_id } })
      }
    }

    const module = await import(`../options/${args.get("organization").value}.js`)

    const auth = await module.getAuth()
    const sheetId = await module.getSheet()
    
    let tournaments = await module.getTournaments(bot, args.get("organization").value)
  
    for (tournament of tournaments) await module.fetchBladersData(bot, tournament)

    let performanceData = await module.fetchPerformanceData(bot, tournaments)

    let classement = await module.computeRanking(bot, performanceData, tournaments.length)    
    if (args.get("send_message")) await module.publishTop(bot, classement, message, tournaments)

    await cleanRanking(bot, auth, sheetId, module.baseSize, `${module.sheet}!B2`)
    await cleanRanking(bot, auth, sheetId, module.rawSize, `RAW ${module.sheet}!A2`)

    let values = await module.getValues(bot, classement, "base")
    let all_values = await module.getValues(bot, classement, tournaments.length)
    await publishRanking(bot, auth, sheetId, values, `${module.sheet}!B2`)
    await publishRanking(bot, auth, sheetId, all_values, `RAW ${module.sheet}!A2`)

    return await message.editReply({ content: "Done.", ephemeral: true })
  }
}

async function cleanRanking(bot, auth, sheetId, width, range) {
  let values = new Array(300).fill(new Array(width).fill(""))
  await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: sheetId, range: range, valueInputOption: "USER_ENTERED", resource: { values } })
}

async function publishRanking(bot, auth, sheetId, values, range) {
  await google.sheets({ version: "v4", auth: auth }).spreadsheets.values.update({ spreadsheetId: sheetId, range: range, valueInputOption: "USER_ENTERED", resource: { values } })
}
