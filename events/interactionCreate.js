const Discord = require("discord.js")

module.exports = async (bot, interaction) => {

  if (interaction.type === Discord.InteractionType.ApplicationCommand) require(`../commands/${interaction.commandName}`).run(bot, interaction, interaction.options)

  else if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {

    let choices = []
    let focusedOption = interaction.options.getFocused(true)

    let tournaments = await bot.Tournaments.findAll({ where: { tournament_season: bot.season } })
    let places = await bot.Places.findAll()

    if (focusedOption.name === "tournament_id") { choices = tournaments.map(tournament => `${tournament.dataValues.tournament_id} - ${tournament.dataValues.tournament_name}`) }
    if (focusedOption.name === "format") { choices = ["Double Élimination", "Simple Élimination", "Ronde Suisse", "Poules", "Training"] }
    if (focusedOption.name === "ruleset") { choices = ["3on3", "1on1", "Team Battle", "Training"] }
    if (focusedOption.name === "status") { choices = ["Inscriptions en cours", "Inscriptions finies", "Tournoi en cours"] }
    if (focusedOption.name === "place") { choices = places.map(place => place.dataValues.place_id) }
    if (focusedOption.name === "regle") { choices = Object.keys(bot.regles) }
    if (focusedOption.name === "annonce") { choices = ["Rappel", "Guide", "Inscriptions"] }
    if (focusedOption.name === "organization") { choices = ["SAtR", "SAtR Paris", "SAtR Marseille", "RPB", "RPB Paris", "RPB Nord"] }

    let filtered = choices.filter(choice => choice.toLowerCase().includes(focusedOption.value.toLowerCase()))
    if (!focusedOption.value) filtered = choices
    if (filtered.length > 20) filtered = filtered.slice(0, 20)
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })))
  }

  else if (interaction.isButton()){
    if (interaction.customId.startsWith("tournament-notify")){
      let tournament = await bot.Tournaments.findOne({ where: { tournament_id: interaction.customId.split('-')[2] } })
      interaction.member.roles.add(tournament.dataValues.tournament_role)
      await interaction.reply({ content: "Tu recevras désormais les notifications liées à ce tournoi.", ephemeral: true })
    }  
  }
}
