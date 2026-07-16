const Discord = require("discord.js")
const Canvas = require('@napi-rs/canvas')

module.exports = {

  name: "spotlight",
  description: "Génère les Beys pour un spotlight",
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

    let x1 = 500
    let x2 = 700
    let x3 = 880

    let y1 = 360
    let y2 = 560
    let y3 = 760

    let lien_blade = "https://raw.githubusercontent.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/refs/heads/master/Blade/"
    let lien_ratchet = "https://raw.githubusercontent.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/refs/heads/master/Ratchet/"
    let lien_bit = "https://raw.githubusercontent.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/refs/heads/master/Bit/"

    try { context.drawImage(await Canvas.loadImage(lien_blade + bey1[0].replace(' ','') + ".png"), x1, y1, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(lien_ratchet + bey1[1] + ".png"), x2, y1, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(lien_bit + bey1[2].replace(' ','%20') + ".png"), x3, y1, taille_img, taille_img) } catch(err) {}

    try { context.drawImage(await Canvas.loadImage(lien_blade + bey2[0].replace(' ','') + ".png"), x1, y2, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(lien_ratchet + bey2[1] + ".png"), x2, y2, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(lien_bit + bey2[2].replace(' ','%20') + ".png"), x3, y2, taille_img, taille_img) } catch(err) {}

    try { context.drawImage(await Canvas.loadImage(lien_blade + bey3[0].replace(' ','') + ".png"), x1, y3, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(lien_ratchet + bey3[1] + ".png"), x2, y3, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(lien_bit + bey3[2].replace(' ','%20') + ".png"), x3, y3, taille_img, taille_img) } catch(err) {}

    return await message.editReply({ content: "C'est bon", files: [new Discord.AttachmentBuilder(await canvas.encode('png'), { name: 'spotlight.png' })]})
    
  }
}
