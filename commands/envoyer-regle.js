const Discord = require("discord.js")
const cron = require("cron")

module.exports = {

  name: "envoyer-regle",
  description: "Envoie un message avec un texte",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Message",
  options: [
    {
      type: "string",
      name: "regle",
      description: "les règles à envoyer",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "date",
      description: "la date à laquel programmer le message, format (DD/MM/YYYY-HH:mm:SS)",
      required: false,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {

    if (bot.regles[args.get("regle").value]) {

      let content = (args.get("regle").value.startsWith("banlist") || args.get("regle").value.startsWith("ruleset")) ? "" : bot.regles[args.get("regle").value]
      let media = []
      if (args.get("regle").value.startsWith("banlist") || args.get("regle").value.startsWith("ruleset")) media.push("./medias/"+args.get("regle").value+".png")

      if (args.get("date")) {
        let datetime = new Date(args.get("date").value.split('-')[0].split('/')[2], args.get("date").value.split('-')[0].split('/')[1] - 1, args.get("date").value.split('-')[0].split('/')[0], args.get("date").value.split('-')[1].split(':')[0], args.get("date").value.split('-')[1].split(':')[1], args.get("date").value.split('-')[1].split(':')[2])
        new cron.CronJob(datetime, () => { message.channel.send({ content: content, files: media })}).start()
        return await message.reply({ content: `C'est bon, les règles seront envoyées le __<t:${Math.floor(datetime) / 1000}:d> à <t:${Math.floor(datetime) / 1000}:T> (<t:${Math.floor(datetime) / 1000}:R>)__.`, ephemeral: true })
      } else {
        await message.channel.send({ content: content, files: media })
        return await message.reply({ content: "C'est bon.", ephemeral: true })
      }
    } else return await message.reply({ content: "Pas de règles disponibles à ce nom.", ephemeral: true })
  }
}
