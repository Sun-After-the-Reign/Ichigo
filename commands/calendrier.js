const Discord = require("discord.js")
const Canvas = require('@napi-rs/canvas')

module.exports = {

  name: "calendrier",
  description: "Génère le calendrier des évènements",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: false,
  category: "Utilitaire",
  options: [
    {
      type: "string",
      name: "title",
      description: "titre du calendrier",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "data",
      description: "données du calendrier",
      required: true,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {

    await message.deferReply()

    Canvas.GlobalFonts.registerFromPath('./medias/calendrier/impact.ttf', 'Impact')
    Canvas.GlobalFonts.registerFromPath('./medias/calendrier/franklin.ttf', 'Franklin')

    let data = args.get("data").value.split(" ~ ")

    let taille_titre_y = 317
    let marge_titre_y = 178
    
    let taille_event_y = 416
    let marge_event_y = 97

    let marge_orga_x = 527
    let marge_eventdata_y = 86
   
    let taille_qr_xy = 307

    let taille_img_x = 2480
    let taille_img_y = taille_titre_y + (marge_titre_y * 2) + 44 + (taille_event_y + marge_event_y) * data.length
    let marge_x = 132

    let canvas = Canvas.createCanvas(taille_img_x, taille_img_y)
    let context = canvas.getContext('2d')

    context.drawImage(await Canvas.loadImage('./medias/calendrier/fond.png'), 0, 0, taille_img_x, taille_img_y)
    context.drawImage(await Canvas.loadImage('./medias/calendrier/shishi.png'), 12, canvas.height-36)

    context.font = '170px Franklin'
    context.fillStyle = '#e54d00'
    let title_text = "CALENDRIER " + args.get("title").value.toUpperCase()
    context.fillText(title_text, (canvas.width / 2) - (context.measureText(title_text).width / 2), 290)
    context.drawImage(await Canvas.loadImage('./medias/calendrier/titre.png'), 0, 0)


    for (let event in data) {
      event_data = data[event].split("  ")
      
      pos_text_y = (taille_titre_y + (marge_titre_y * 2)) + 72 + ((taille_event_y + marge_event_y) * event)

      context.font = '90px Impact'
      context.fillStyle = '#e54d00'
      context.fillText(event_data[0], marge_x, pos_text_y)

      context.font = '72px Franklin'
      context.fillStyle = '#ffffff'

      context.fillText(event_data[1], marge_x, pos_text_y + marge_eventdata_y * 1)
      context.fillText(event_data[2], marge_x, pos_text_y + marge_eventdata_y * 2)
      context.fillText(event_data[3], marge_x, pos_text_y + marge_eventdata_y * 3)

      context.font = '62px Franklin'
      context.fillText("Organisé par", marge_x, pos_text_y + marge_eventdata_y * 4)
      context.drawImage(await Canvas.loadImage('./medias/calendrier/ORGA/' + event_data[4].split("Organisé par ")[1] + '.png'), marge_orga_x, (pos_text_y + marge_eventdata_y * 4) - 59)
      context.drawImage(await Canvas.loadImage('./medias/calendrier/QR/' + event_data[4].split("Organisé par ")[1] + '.png'), taille_img_x - marge_x - taille_qr_xy, (pos_text_y + marge_eventdata_y * 4) - taille_qr_xy, taille_qr_xy, taille_qr_xy)

    }
    return await message.editReply({ content: "C'est bon", files: [new Discord.AttachmentBuilder(await canvas.encode('png'), { name: 'calendrier.png' })]})
    
  }
}
