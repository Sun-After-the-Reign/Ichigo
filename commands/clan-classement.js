const Discord = require("discord.js")

module.exports = {

  name: "clan-classement",
  description: "Affiche le résultat d'un clan à un tournoi",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Classement",
  options: [
    {
      type: "string",
      name: "tournament",
      description: "Tournoi à calculer",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "complet",
      description: "Résultats complets ou juste top 3",
      required: false,
      autocomplete: true,
    },
    {
      type: "string",
      name: "score",
      description: "Affichage du score ou non",
      required: false,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {

    await message.deferReply({ ephemeral: true })

    let msg = ""

    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: agrs.get("tournament").value } })

    let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' }
    let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?community_id=sunafterthereign&per_page=200", requestOptions)
    let response = await request.json()

    let participants_size = response.data.length

    let participants = response.data.filter(p => p.attributes.name.includes(" | "))

    let clans = Array.from(new Set(participants.map(p => p.attributes.name.split[" | "][0]))).sort((a, b) => a.attributes.final_rank - b.attributes.final_rank)

    for (clan of clans){
      let players = participants.filter(p => p.attributes.name.split[" | "][0] == clan).sort()

      let clan_score = 0
      let players_data = []

      for (player of players) {
        players_data.append(`- ${player.attributes.name.split[" | "][1]} - top ${player.attributes.final_rank} - +${participants_size - (player.attributes.final_rank - 1)}pts`)
        clan_score += participants_size - (player.attributes.final_rank - 1)
      }

      msg += `## ${clan}\n` + players_data.join('\n')
    }

    return await message.editReply(msg)

  }
}
