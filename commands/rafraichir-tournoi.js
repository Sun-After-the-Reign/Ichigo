const Discord = require("discord.js")
const Sequelize = require("sequelize")

module.exports = {

  name: "rafraichir-tournoi",
  description: "Rafraichit les embed de tournois",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Tournoi",

  async run(bot, message, args) {

    await message.deferReply({ ephemeral: true })

    let tournaments = await bot.Tournaments.findAll({ where: { tournament_message: { [Sequelize.Op.gt]: 0 } } })

    for (tournament of tournaments) await require(`../events/.postTournamentEmbed.js`).run(bot, tournament, true)

    return await message.editReply({ content: "Done.", ephemeral: true })
  }
}
