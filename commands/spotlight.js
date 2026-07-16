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
      name: "bey1",
      description: "First Bey",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "bey2",
      description: "Second Bey",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "bey3",
      description: "Third Bey",
      required: true,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {

    await message.deferReply()

    let bey1 = args.get("bey1").value.split("/")
    let bey2 = args.get("bey2").value.split("/")
    let bey3 = args.get("bey3").value.split("/")

    let canvas = Canvas.createCanvas(1080, 1080)
    let context = canvas.getContext('2d')

    let taille_img = 190

    let x1 = 540
    let x2 = 740
    let x3 = 950

    let y1 = 360
    let y2 = 580
    let y3 = 820

    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Blade/${bey1[0]}.png`), x1, y1, taille_img, taille_img)
    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Ratchet/${bey1[1]}.png`), x2, y1, taille_img, taille_img)
    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Bit/${bey1[2]}.png`), x3, y1, taille_img, taille_img)

    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Blade/${bey2[0]}.png`), x1, y2, taille_img, taille_img)
    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Ratchet/${bey2[1]}.png`), x2, y2, taille_img, taille_img)
    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Bit/${bey2[2]}.png`), x3, y2, taille_img, taille_img)

    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Blade/${bey3[0]}.png`), x1, y3, taille_img, taille_img)
    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Ratchet/${bey3[1]}.png`), x2, y3, taille_img, taille_img)
    context.drawImage(await Canvas.loadImage(`https://github.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/blob/master/Bit/${bey3[2]}.png`), x3, y3, taille_img, taille_img)

    return await message.editReply({ content: "C'est bon", files: [new Discord.AttachmentBuilder(await canvas.encode('png'), { name: 'spotlight.png' })]})
    
  }
}
