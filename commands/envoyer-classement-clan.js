const Discord = require("discord.js")
const Canvas = require('@napi-rs/canvas')

module.exports = {

  name: "envoyer-classement-clan",
  description: "Affiche le résultat d'un clan à un tournoi",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Classement",
  options: [
    {
      type: "string",
      name: "data",
      description: "Les données du classement",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "events",
      description: "Liste des évènements",
      required: true,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {

    await message.deferReply({ ephemeral: true })

    let base_icon = [96, 221]
    let base_info = [230, 258]
    let base_info_modif = [0, 20, 38, 74]
    let x_decal_base = 540
    let y_decal_base = 154

    let rank = 1

    let data_clans = args.get("data").value.split('|')

    let date = new Date()

    Canvas.GlobalFonts.registerFromPath('./medias/top10/Clans/franklin.ttf', 'Franklin')
    Canvas.GlobalFonts.registerFromPath('./medias/top10/Clans/impact.ttf', 'Impact')
    let canvas = Canvas.createCanvas(1110, 1110)
    let context = canvas.getContext('2d')

    context.drawImage(await Canvas.loadImage('./medias/top10/Clans/base.png'), 0, 0, 1110, 1110)

    context.font = '16px Franklin'
    context.fillStyle = '#7d7d7d'

    context.fillText("Calculé en fonction des résultats des Beyblade Battle Tournament 3on3", 31, 1024)
    context.fillText("Basé sur : " + args.get("events").value, 31, 1044)
    context.fillText("Mise à jour du " + String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear() + ' - ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0'), 31, 1064)

    context.fillStyle = '#ffffff'

    for (data_clan of data_clans) {

      let tag = data_clan.split(';')[0]
      let name = data_clan.split(';')[1]
      let score = data_clan.split(';')[2]
      let players = data_clan.split(';')[3]

      let x_decal = (x_decal_base * (Math.ceil(rank / 5) - 1))
      let y_decal = (y_decal_base * ((rank - 1) % 5))

      try { context.drawImage(await Canvas.loadImage(`./medias/clans/base/${tag}.png`), base_icon[0] + x_decal, base_icon[1] + y_decal, 122, 122) } catch (err) { context.drawImage(await Canvas.loadImage("https://user-assets.challonge.com/misc/challonge_fireball_gray.png"), base_icon[0] + x_decal, base_icon[1] + y_decal, 122, 122) }
    
      context.font = '32px Impact'
      context.fillText(name.toUpperCase(), base_info[0] + x_decal, base_info[1] + y_decal + base_info_modif[0])

      context.font = '16px Franklin'
      context.fillText(players + " membres", base_info[0] + x_decal, base_info[1] + y_decal + base_info_modif[1])
    
      context.font = '26px Franklin'
      context.fillText("SCORE " + score, base_info[0] + x_decal, base_info[1] + y_decal + base_info_modif[3])

      rank++
    }

    message.editReply({ content: "C'est bon." })

    return await message.channel.send({ content: "## Classement Clans - saison 3", files: [new Discord.AttachmentBuilder(await canvas.encode('png'), { name: 'ranking_satr.png' })]})

  }
}
