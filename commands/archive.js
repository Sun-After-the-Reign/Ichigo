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

    let medias = []
    let messages = args.get("messages").value.split(' ')
    let regex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/

    for (message_url of messages) {
      match = message_url.match(regex)
      [_, _, channelId, messageId] = match
      channel = await message.guild.channels.fetch(channelId)
      message = await channel.messages.fetch(messageId)
      for (attachment of message.attachments) {
        medias.push(attachment.url)
        if (medias.length == 10){
          await message.channel.send({content : "archive", files : medias})} 
          medias = []
        }
      }
    return await message.reply({content: "C'est bon."})
  }

}
