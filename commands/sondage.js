const Discord = require("discord.js")

module.exports = {

  name: "sondage",
  description: "Créer un sondage avec des emojis",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Utilitaire",
  options: [
    {
      type: "string",
      name: "id",
      description: "id du message",
      required: true,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {

    await message.reply({content: "Reacting..", ephemeral: true})

    message.channel.messages.fetch(args.get("id").value)
      .then(function(msg){
        msg.react("✅")
        msg.react("❔")
        msg.react("❌")})
      .catch((error) => {return message.editReply({content: "Aucun message avec cet id.", ephemeral: true})})

    return await message.editReply({content: "C'est bon.", ephemeral: true})
  }
}
