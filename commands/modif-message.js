const Discord = require("discord.js")

module.exports = {

  name: "modif-message",
  description: "Modifie un message avec un texte",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Message",
  options: [
    {
      type: "string",
      name: "id",
      description: "l'id du message à modifier",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "texte",
      description: "le texte du message",
      required: false,
      autocomplete: false,
    },
    {
      type: "string",
      name: "media1",
      description: "le lien vers un média",
      required: false,
      autocomplete: false,
    },
    {
      type: "string",
      name: "media2",
      description: "le lien vers un média",
      required: false,
      autocomplete: false,
    },
    {
      type: "string",
      name: "media3",
      description: "le lien vers un média",
      required: false,
      autocomplete: false,
    },
    {
      type: "string",
      name: "media4",
      description: "le lien vers un média",
      required: false,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {

    let content = "none"
    let medias = []

    if (args.get("texte")) content = args.get("texte").value.replaceAll("\\n", "\n")

    if (args.get("media1")) medias.push({ attachment: args.get("media1").value })
    if (args.get("media2")) medias.push({ attachment: args.get("media2").value })
    if (args.get("media3")) medias.push({ attachment: args.get("media3").value })
    if (args.get("media4")) medias.push({ attachment: args.get("media4").value })
      
    if (content != "none") message.channel.messages.fetch(args.get("id").value).then(ancien_message => ancien_message.edit({ content: content }))
    if (medias.length != 0){
      if (medias[0].attachment == "none") message.channel.messages.fetch(args.get("id").value).then(ancien_message => ancien_message.edit({ files: [] }))
      else message.channel.messages.fetch(args.get("id").value).then(ancien_message => ancien_message.edit({ files: medias }))
    }
    return await message.reply({ content: "C'est bon.", ephemeral: true })
  }
}
