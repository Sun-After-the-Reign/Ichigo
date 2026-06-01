const Discord = require("discord.js")

module.exports = {

  name: "repete",
  description: "Renvoie un texte",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: false,
  category: "Message",
  options: [
    {
      type: "string",
      name: "texte",
      description: "Le texte à renvoyer",
      required: true,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {
    await message.channel.send(args.get("texte").value)
    return await message.reply({content: "C'est bon.", ephemeral: true})
  }
}
