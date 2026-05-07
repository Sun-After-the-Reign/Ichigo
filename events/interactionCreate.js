const Discord = require("discord.js")

module.exports = async (bot, interaction) => {

  if (interaction.type === Discord.InteractionType.ApplicationCommand) require(`../commands/${interaction.commandName}`).run(bot, interaction, interaction.options)

  else if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {

    let choices = []
    let focusedOption = interaction.options.getFocused(true)

    let tournaments = await bot.Tournaments.findAll({ where: { tournament_season: bot.season } })
    let teams = await bot.Teams.findAll({ where: { team_status: "ACTIVE" } })
    let places = await bot.Places.findAll()

    if (interaction.commandName === "aide") { choices = bot.commands.map(cmd => cmd.name) }
    if (focusedOption.name === "tournament_id") { choices = tournaments.map(tournament => `${tournament.dataValues.tournament_id} - ${tournament.dataValues.tournament_name}`) }
    if (focusedOption.name === "team_id") { choices = teams.map(team => `${team.dataValues.team_id} - ${team.dataValues.team_name}`) }
    if (focusedOption.name === "format") { choices = ["Double Élimination", "Simple Élimination", "Training"] }
    if (focusedOption.name === "ruleset") { choices = ["3on3", "1on1", "3vs3", "Training"] }
    if (focusedOption.name === "status") { choices = ["Inscriptions en cours", "Inscriptions finies", "Tournoi en cours"] }
    if (focusedOption.name === "team_status") { choices = ["ACTIVE", "INACTIVE"] }
    if (focusedOption.name === "place") { choices = places.map(place => place.dataValues.place_id) }
    if (focusedOption.name === "regle") { choices = Object.keys(bot.regles) }
    if (focusedOption.name === "annonce") { choices = ["Rappel", "Guide", "Inscriptions"] }

    let filtered = choices.filter(choice => choice.toLowerCase().includes(focusedOption.value.toLowerCase()))
    if (!focusedOption.value) filtered = choices
    if (filtered.length > 20) filtered = filtered.slice(0, 20)
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })))
  }

  else if (interaction.isButton()){
    if (interaction.customId.startsWith("tournament-join")) require("./.formInscription.js").run(bot, interaction)
    if (interaction.customId.startsWith("tournament-leave")) require("./.addInscription.js").run(bot, interaction)
    if (interaction.customId.startsWith("tournament-notify")){
      let tournament = await bot.Tournaments.findOne({ where: { tournament_id: interaction.customId.split('-')[2] } })
      interaction.member.roles.add(tournament.dataValues.tournament_role)
      await interaction.reply({ content: "Tu recevras desormais les notifications liées à ce tournoi.", ephemeral: true })
    }  

    if (interaction.customId.startsWith("watchlist")) {
      let count = parseInt(interaction.message.embeds[0].description.split(": ")[1])
      let embed = new Discord.EmbedBuilder().setTitle(interaction.message.embeds[0].title).setImage(interaction.message.embeds[0].image.url)
      if (interaction.customId.endsWith("up")) count += 1
      if (interaction.customId.endsWith("down")) count -= 1
      if (interaction.customId.endsWith("reset")) count = 0
      
      embed.setDescription("Compte : " + count)

      interaction.deferUpdate()
     
      return await interaction.message.edit({ embeds: [embed] })
    }
  }

  else if (interaction.customId.startsWith("tournament-inscription")) require("./.addInscription.js").run(bot, interaction)
}
