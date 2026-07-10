const Discord = require("discord.js")
const { request } = require('undici')

module.exports = {

  async run(bot, tournament, update = false) {

    let place = await bot.Places.findOne({ where: { place_id: tournament.dataValues.tournament_place } })
    let channel = await bot.channels.fetch(place.dataValues.place_inscr.split('/')[5])
    
    let embed = new Discord.EmbedBuilder()
      .setColor(bot.color)
      .setAuthor({ name: 'Ichigo - Sun After the Reign', iconURL: bot.user.displayAvatarURL() })
      .setTitle(tournament.dataValues.tournament_name)
      .setDescription(tournament.dataValues.tournament_desc)
      .setImage(tournament.dataValues.tournament_poster)
      .setFooter({text: `Merci de consulter le règlement avant de vous inscrire.`, iconURL: `${channel.guild.iconURL()}`})
      .addFields(
        { name: ':small_orange_diamond: Date', value: `Le <t:${tournament.dataValues.tournament_date}:F>` },
        { name: ':small_orange_diamond: Lieu', value: `${place.dataValues.place_name}, ${place.dataValues.place_city}` },
        { name: ':small_orange_diamond: Règlement', value: `${tournament.dataValues.tournament_ruleset}`, inline: true },
        { name: ':small_orange_diamond: Format', value: `${tournament.dataValues.tournament_format}`, inline: true },
        { name: ':small_orange_diamond: Challonge', value: "https://challonge.com/" + tournament.dataValues.tournament_id },
        { name: ':small_orange_diamond: Statut', value: `${tournament.dataValues.tournament_status}`, inline: true },
      )
    if (tournament.dataValues.tournament_status == "Tournoi fini") {

      let participantsNumber = "N/A"

      if (tournament.dataValues.tournament_challonge) {
        let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' }
        let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?community_id=sunafterthereign&per_page=200", requestOptions)
        let participants = await request.json()
        participantsNumber = tournament.dataValues.tournament_ruleset == "Team Battle" ? participants.data.length * 3 : tournament.dataValues.tournament_ruleset == "2vs2" ? participants.data.length * 2 : participants.data.length
      }

      first = /^[0-9]*$/.test(tournament.dataValues.tournament_first) ? `<@${tournament.dataValues.tournament_first}>` : tournament.dataValues.tournament_first
      second = /^[0-9]*$/.test(tournament.dataValues.tournament_second) ? `<@${tournament.dataValues.tournament_second}>` : tournament.dataValues.tournament_second
      third = /^[0-9]*$/.test(tournament.dataValues.tournament_third) ? `<@${tournament.dataValues.tournament_third}>` : tournament.dataValues.tournament_third 

      embed.addFields(
        { name: ':small_orange_diamond: Participants', value: participantsNumber.toString(), inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: ':trophy: Résultats', value: '\u200B' },
        { name: ':first_place: ', value: first, inline: true },
        { name: ':second_place:', value: second, inline: true },
        { name: ':third_place:', value: third, inline: true },
      )
    }

    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setLabel("Challonge")
        .setStyle(Discord.ButtonStyle.Link)
        .setURL("https://challonge.com/" + tournament.dataValues.tournament_id),
      new Discord.ButtonBuilder()
        .setLabel("Recevoir les notifications")
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji('🔔')
        .setCustomId(`tournament-notify-${tournament.dataValues.tournament_id}`)
    )

    if (!update) return await channel.send({ content: "", embeds: [embed], components: [row]})
    else {
      if (tournament.dataValues.tournament_status != "Inscriptions en cours") return await channel.messages.fetch(tournament.dataValues.tournament_message).then(message => message.edit({ content: "", embeds: [embed], components: [] }))
      else await channel.messages.fetch(tournament.dataValues.tournament_message).then(message => message.edit({ content: "", embeds: [embed], components: [row] }))
    }
  }
}
