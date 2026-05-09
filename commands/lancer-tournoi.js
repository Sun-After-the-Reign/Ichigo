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

    await message.deferReply({ ephemeral: true })

    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: args.get("tournament_id").value.split(" - ")[0] } })
    
    let req = await request(`https://api.challonge.com/v1/tournaments/${tournament.dataValues.tournament_challonge}/participants.json?api_key=${bot.challonge}`)
    let participants = await req.body.json()

    await participants.forEach(item => { bot.participants.set(item.participant.id, item.participant.name) })

    bot.suivi = tournament.dataValues.tournament_challonge

    bot.emit("check")

    return await message.editReply({content: "Done.", ephemeral: true})
  }
}
