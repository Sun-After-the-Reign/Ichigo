const Discord = require("discord.js")

module.exports = {

  name: "liste-clan",
  description: "Donne les clans inscrits à un tournoi",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Classement",
  options: [
    {
      type: "string",
      name: "tournament_id",
      description: "Tournoi à calculer",
      required: true,
      autocomplete: true,
    }
  ],

  async run(bot, message, args) {

    await message.deferReply()

    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: args.get("tournament_id").value.split(" - ")[0] } })

    let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' }
    let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?community_id=sunafterthereign&per_page=200", requestOptions)
    let response = await request.json()

    let participants = response.data.filter(p => p.attributes.name.includes(" | ") && p.attributes.final_rank != null)

    let clans = Array.from(new Set(participants.map(p => p.attributes.name.split(" | ")[0]))).sort()

    return await message.editReply(clans.join('\n'))

  }
}
