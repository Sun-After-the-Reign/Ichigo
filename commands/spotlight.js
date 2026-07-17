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
      name: "organization",
      description: "Organization to show spotlight for",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "top",
      description: "Trophy to display",
      required: true,
      autocomplete: false,
    },
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

    let taille_img = 1080

    let canvas = Canvas.createCanvas(taille_img, taille_img)
    let context = canvas.getContext('2d')

    let taille_blade = 194
    let taille_reste = 170    

    let x1 = 635 - (taille_blade/2)
    let x2 = 830 - (taille_reste/2)
    let x3 = 991 - (taille_reste/2)

    let y1 = 441 - (taille_blade/2)
    let y12 = 441 - (taille_reste/2)
    let y2 = 675 - (taille_blade/2)
    let y22 = 675 - (taille_reste/2)
    let y3 = 906 - (taille_blade/2)
    let y32 = 906 - (taille_reste/2)

    let rib = ["OPerate", "TuRbo"]
    let uxe = ["Aegis Rampart", "Bison Burrow", "Bullet Griffon", "Glory Valkyrie", "Hells Nether", "Shinobi Shuriken"]

    let lien_blade = "https://raw.githubusercontent.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/refs/heads/master/Blade/"
    let lien_ratchet = "https://raw.githubusercontent.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/refs/heads/master/Ratchet/"
    let lien_bit = "https://raw.githubusercontent.com/Sun-After-the-Reign/Beyblade-X-Parts-Image-Database/refs/heads/master/Bit/"

    try { context.drawImage(await Canvas.loadImage(`./medias/spotlight/fond.png`), 0, 0, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(`./medias/spotlight/${args.get("organization").value}.png`), 0, 0, taille_img, taille_img) } catch(err) {}
    try { context.drawImage(await Canvas.loadImage(`./medias/spotlight/${args.get("top").value}.png`), 0, 0, taille_img, taille_img) } catch(err) {}

    if (bey1[0] != "CX") try { context.drawImage(await Canvas.loadImage(lien_blade + bey1[0].replace(' ','') + ".png"), x1, y1, taille_blade, taille_blade) } catch(err) {}
    if (uxe.includes(bey1[0]) || rib.includes(bey1[1])) try { context.drawImage(await Canvas.loadImage(lien_bit + bey1[1].replace(' ','%20') + ".png"), x2, y12, taille_reste, taille_reste) } catch(err) {}
    else {
      try { context.drawImage(await Canvas.loadImage(lien_ratchet + bey1[1] + ".png"), x2, y12, taille_reste, taille_reste) } catch(err) {}
      try { context.drawImage(await Canvas.loadImage(lien_bit + bey1[2].replace(' ','%20') + ".png"), x3, y12, taille_reste, taille_reste) } catch(err) {}
    }

    if (bey2[0] != "CX") try { context.drawImage(await Canvas.loadImage(lien_blade + bey2[0].replace(' ','') + ".png"), x1, y2, taille_blade, taille_blade) } catch(err) {}
    if (uxe.includes(bey2[0]) || rib.includes(bey2[1])) try { context.drawImage(await Canvas.loadImage(lien_bit + bey2[1].replace(' ','%20') + ".png"), x2, y22, taille_reste, taille_reste) } catch(err) {}
    else {
      try { context.drawImage(await Canvas.loadImage(lien_ratchet + bey2[1] + ".png"), x2, y22, taille_reste, taille_reste) } catch(err) {}
      try { context.drawImage(await Canvas.loadImage(lien_bit + bey2[2].replace(' ','%20') + ".png"), x3, y22, taille_reste, taille_reste) } catch(err) {}
    }

    if (bey3[0] != "CX") try { context.drawImage(await Canvas.loadImage(lien_blade + bey3[0].replace(' ','') + ".png"), x1, y3, taille_blade, taille_blade) } catch(err) {}
    if (uxe.includes(bey3[0]) || rib.includes(bey3[1])) try { context.drawImage(await Canvas.loadImage(lien_bit + bey3[1].replace(' ','%20') + ".png"), x2, y32, taille_reste, taille_reste) } catch(err) {}
    else {
      try { context.drawImage(await Canvas.loadImage(lien_ratchet + bey3[1] + ".png"), x2, y32, taille_reste, taille_reste) } catch(err) {}
      try { context.drawImage(await Canvas.loadImage(lien_bit + bey3[2].replace(' ','%20') + ".png"), x3, y32, taille_reste, taille_reste) } catch(err) {}
    }   
    
    return await message.editReply({ content: "C'est bon.", files: [new Discord.AttachmentBuilder(await canvas.encode('png'), { name: 'spotlight.png' })]})
    
  }
}
