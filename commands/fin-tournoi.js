const Discord = require("discord.js")
const Canvas = require('@napi-rs/canvas')

module.exports = {

  name: "fin-tournoi",
  description: "Termine un tournoi sur le serveur",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Tournoi",
  options: [
    {
      type: "string",
      name: "tournament_id",
      description: "The tournament id to edit",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "first",
      description: "First place at the tournament",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "second",
      description: "Second place at the tournament",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "third",
      description: "Third place at the tournament",
      required: true,
      autocomplete: false,
    },
    {
      type: "channel",
      name: "post_result",
      description: "Channel to post the results of the tournament",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "qr",
      description: "Challonge QR",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "delete_role",
      description: "Option to delete participation role",
      required: false,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {

    await message.deferReply({ ephemeral: true })

    let id = args.get("tournament_id").value.split(" - ")[0]

    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: id } })

    let first = args.get("first").value
    let second = args.get("second").value
    let third = args.get("third").value
  
    bot.Tournaments.update({ tournament_first: first, tournament_second: second, tournament_third: third, tournament_status: "Tournoi fini", tournament_event: "", tournament_role: "" }, { where: { tournament_id: id } })
    if (tournament.dataValues.tournament_challonge) bot.Tournaments.update({ tournament_participants: "challonge" }, { where: { tournament_id: id } })
    if (args.get("delete_role")) message.guild.roles.fetch(tournament.dataValues.tournament_role).then(role => role.delete())
  
    let tournament_updated = await bot.Tournaments.findOne({ where: { tournament_id: id } })
    await require(`../events/.postTournamentEmbed.js`).run(bot, tournament_updated, true)

    let content = `## ${tournament_updated.dataValues.tournament_name} (<t:${tournament_updated.dataValues.tournament_date}:d>) - **${tournament_updated.dataValues.tournament_ruleset}** - \<:challonge:1310799875864268800> [Challonge](https://challonge.com/${tournament_updated.dataValues.tournament_id})` + "\n"
    content += `- :trophy: **1ʳᵉ place** - ${first.match(/^[0-9]{18}/) ? "<@" + first + ">" : first}` + "\n"
    content += `- :second_place: **2ᵉ place** - ${second.match(/^[0-9]{18}/) ? "<@" + second + ">" : second}` + "\n"
    content += `- :third_place: **3ᵉ place** - ${third.match(/^[0-9]{18}/) ? "<@" + third + ">" : third}` + "\n"
    content += "\n"
    content += "Bravo à tous·tes !"

    let image = await computeImage(bot, tournament_updated)

    let channel = await message.guild.channels.fetch(args.get("post_result").value)
    await channel.send({ content: content, files: [new Discord.AttachmentBuilder(await image.encode('png'), { name: 'top8.png' })] })
    
    return await message.editReply({ content: "Done.", ephemeral: true })
  }
}

async function computeImage(bot, tournament) {
  Canvas.GlobalFonts.registerFromPath('./medias/top8/franklin.ttf', 'Franklin')
  Canvas.GlobalFonts.registerFromPath('./medias/top8/impact.ttf', 'Impact')

  let canvas = Canvas.createCanvas(1110, 1110)
  let context = canvas.getContext('2d')

  let y_decal_base = 100
  let x_decal_base = -45
  let base_icon = [98, 208]
  let base_info = [190, 246]
  let base_info_modif = [0, 20, 36]
  let base_clan = [989, 208]
  let base_historic = [930, 230]
  let rank = 1

  context.drawImage(await Canvas.loadImage('./medias/top8/base.png'), 0, 0, 1110, 1110)

  context.font = '36px Franklin'
  context.fillStyle = '#ffffff'
  context.fillText(tournament.dataValues.tournament_name.toUpperCase(), 35, 175)

  context.font = '16px Franklin'
  context.fillStyle = '#7d7d7d'

  let date = new Date(Math.floor(tournament.dataValues.tournament_date) * 1000)
  let place = await bot.Places.findOne({ where: { place_id: tournament.dataValues.tournament_place } })

  context.fillText(tournament.dataValues.tournament_name + " - Sun After the Reign saison " + tournament.dataValues.tournament_season, 35, 1040)
  context.fillText(tournament.dataValues.tournament_ruleset + " - " + tournament.dataValues.tournament_format, 35, 1060)
  context.fillText(String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear() + ' - ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + " à " + place.dataValues.place_name + ", " + place.dataValues.place_city, 35, 1080)

  context.drawImage(await Canvas.loadImage(args.get("qr").value), 956, 33, 120, 120)

  context.fillStyle = '#ffffff'

  let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' }
  let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/matches.json?community_id=sunafterthereign&per_page=200", requestOptions)
  let response = await request.json()

  let matches = response.data
  let participants = response.included.filter(p => p.type === "participant" && p.attributes.final_rank <= 8 && p.attributes.final_rank != null).sort((a, b) => a.attributes.final_rank != b.attributes.final_rank ? a.attributes.final_rank - b.attributes.final_rank : a.attributes.name - b.attributes.name)


  for (let player of participants) {

    let y_decal = (y_decal_base * (rank - 1))

    let blader = await bot.Bladers.findOne({ where: { blader_username: player.attributes.username, blader_organization: "SAtR" } })
    try { context.drawImage(await Canvas.loadImage(blader?.dataValues.blader_avatarurl), base_icon[0], base_icon[1] + y_decal, 82, 82) } catch (err) { context.drawImage(await Canvas.loadImage("https://user-assets.challonge.com/misc/challonge_fireball_gray.png"), base_icon[0], base_icon[1] + y_decal, 82, 82) }
    if (blader?.dataValues.blader_clan) context.drawImage(await Canvas.loadImage(`./medias/clans/${blader?.dataValues.blader_clan}.png`), base_clan[0], base_clan[1] + y_decal, 82, 82)

    let playerMatches = matches.filter(m => m.attributes.scores != "0 - 0" && (m.attributes.points_by_participant[0].participant_id == player.id || m.attributes.points_by_participant[1].participant_id == player.id))

    let winrate = playerMatches.data.filter(m => m.attributes.winner_id == player.id).length / playerMatches.data.length
    let historics = playerMatches.data.map(m => m.attributes.winner_id == player.id ? "W" : "L")
    let points = playerMatches.data.map(m => m.attributes.points_by_participant.find(p => p.participant_id == player.id).scores[0] > 4 ? 4 : m.attributes.points_by_participant.find(p => p.participant_id == player.id).scores[0]).reduce((a, b) => a + b, 0)

    context.font = '36px Impact'
    context.fillText(blader ? blader.dataValues.blader_displayname.slice(0, 24) : player.attributes.name.slice(0, 24), base_info[0], base_info[1] + y_decal + base_info_modif[0])

    context.font = '16px Franklin'
    context.fillText((winrate * 100).toFixed(2) + "% WR", base_info[0], base_info[1] + y_decal + base_info_modif[1])
    context.fillText((points / playerMatches.data.length).toFixed(2) + " pts/match", base_info[0], base_info[1] + y_decal + base_info_modif[2])

    let hist = 1

    for (let historic of historics.reverse()) {
      let x_decal = (x_decal_base * (hist - 1))
      context.drawImage(await Canvas.loadImage(`./medias/top8/${historic}.png`), base_historic[0] + x_decal, base_historic[1] + y_decal)
      hist++
    }
    rank++
  }
  return canvas
}