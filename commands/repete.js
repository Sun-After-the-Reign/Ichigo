const Discord = require("discord.js")

module.exports = {

  name: "repete",
  description: "Renvoie un texte",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: false,
  category: "Utilitaire",
  options: [
    {
      type: "string",
      name: "text",
      description: "Le texte à renvoyer",
      required: true,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {
    await message.channel.send(args.get("text").value)
    return await message.reply({content: "C'est bon.", ephemeral: true})
  }
}
