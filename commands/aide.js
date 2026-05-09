const Discord = require("discord.js")

module.exports = {

  name: "aide",
  description: "Affiche le menu d'aide",
  permission: null,
  dm: true,
  category: "Utilitaire",
  options: [
    {
      type: "string",
      name: "commande",
      description: "commande à afficher",
      required: false,
      autocomplete: true,
    }
  ],

  async run(bot, message, args) {

    let command
    if (args.get("commande")){
      command = bot.commands.get(args.get("commande").value)
      if (!command) return message.reply({ content: "Aucune commande à ce nom.", ephemeral : true })
    }

    let embed = new Discord.EmbedBuilder()
    .setColor(bot.color)
    .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
    .setTimestamp()
    .setFooter({text: 'un bot par @shishi4272', iconURL: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'})

    if (!command){

      categories = []
      bot.commands.forEach(command => { if (!categories.includes(command.category)) categories.push(command.category) })
      embed.setTitle("Liste des commandes")
      embed.setDescription(`Commande disponibles : \`${bot.commands.size}\` \nCatégories disponibles : \`${categories.length}\``)

      await categories.sort().forEach(async cat => {
        let commands = bot.commands.filter(cmd => cmd.category === cat)
        embed.addFields({name: `${cat}`, value: `${commands.map(cmd => `\`${cmd.name}\` ${cmd.permission ? "(admin) " : ""}: ${cmd.description}`).join("\n")}`})
      })

    } else {
      embed.setTitle(`${command.name}`)
      embed.setDescription(`Description : \`${command.description}\` \nPermissions requises : \`${typeof command.permission !== "bigint" ? command.permission !== null ? command.permission : "Aucune" : new Discord.PermissionsBitField(command.permission).toArray(false)}\` \nDisponible en MP : \`${command.dm ? "Oui" : "Non"}\` \nCatégorie : \`${command.category}\``)
    }
    return await message.reply({embeds: [embed]})
  }
}
