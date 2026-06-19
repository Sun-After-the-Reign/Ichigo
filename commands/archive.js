const Discord = require("discord.js")

module.exports = {

  name: "archive",
  description: "Envoie les archives de messages",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Utilitaire",
  options: [
    {
      type: "string",
      name: "messages",
      description: "message à archiver",
      required: true,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {

    await message.deferReply({ ephemeral: true })

    let medias = []
    let messages = args.get("messages").value.split(' ')

    for (message_url of messages) {
      let channel = await message.guild.channels.fetch(message_url.split('/')[5])
      let msg = await channel.messages.fetch(message_url.split('/')[6])

      for (attachment of msg.attachments) {
        medias.push(attachment[1].url)
        if (medias.length == 9){
          await message.channel.send({content : "archive", files : medias})
          medias = []
        }
      }
    }
    await message.channel.send({ content: "archiving...", files: medias })
    return await message.editReply({ content: "C'est bon.", ephemeral: true })
  }
}
