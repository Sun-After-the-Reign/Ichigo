const Discord = require("discord.js")

module.exports = {

  name: "classement-clan",
  description: "Affiche le résultat d'un clan à un tournoi",
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

    await message.deferReply()

    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: args.get("tournament_id").value.split(" - ")[0] } })

    let msg = `## Résultats du ${tournament.dataValues.tournament_name} pour les clans.\n`

    let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' }
    let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?community_id=sunafterthereign&per_page=200", requestOptions)
    let response = await request.json()

    let participants_size = response.data.filter(p => p.attributes.final_rank != null).length

    let participants = response.data.filter(p => p.attributes.name.includes(" | ") && p.attributes.final_rank != null)

    let clans = Array.from(new Set(participants.map(p => p.attributes.name.split(" | ")[0]))).sort()

    for (clan of clans){
      let total_players = participants.filter(p => p.attributes.name.split(" | ")[0] == clan).sort((a, b) => a.attributes.final_rank - b.attributes.final_rank)
      let players = args.get("complet") ? total_players : total_players.slice(0,3)

      let clan_score = 0
      let players_data = []
      let place = 0

      for (player of players) {
        
        if (place < 3 && args.get("score")) {
          players_data.push(`\`- ${player.attributes.name.split(" | ")[1]} (TOP ${player.attributes.final_rank}) +${participants_size - (player.attributes.final_rank - 1)}pts\``)
          clan_score += participants_size - (player.attributes.final_rank - 1)
        } else {
          players_data.push(`\`- ${player.attributes.name.split(" | ")[1]} (TOP ${player.attributes.final_rank})\``)
        }
        place++
      }

      msg += `### ${clan} (${total_players.length} joueurs enregistrés) ${clan_score > 0 ? `+${clan_score}pts` : ""}\n` + players_data.join('\n') + '\n'
    }

    return await message.editReply(msg)

  }
}
