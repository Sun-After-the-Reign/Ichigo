const Discord = require("discord.js")
const { fetch } = require('undici')
const cron = require("cron")

module.exports = {

  name: "ajout-tournoi",
  description: "Créer un nouveau tournoi sur le serveur",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Tournoi",
  options: [
    {
      type: "string",
      name: "id",
      description: "Tournament id",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "title",
      description: "Tournament title",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "description",
      description: "Description in the announcement message",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "date",
      description: "When is the tournament, format (DD/MM/YYYY-HH:mm:SS)",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "ruleset",
      description: "Ruleset of the tournament",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "format",
      description: "Format of the tournament",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "place",
      description: "Where is the tournament",
      required: true,
      autocomplete: true,
    },
    {
      type: "Channel",
      name: "post_pub",
      description: "Channel to publish the tournament",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "poster",
      description: "Poster URL to display",
      required: false,
      autocomplete: false,
    },
    {
      type: "string",
      name: "date_pub",
      description: "Date to pub the tournament, format (DD/MM/YYYY-HH:mm:SS)",
      required: false,
      autocomplete: false,
    }
  ],

  async run(bot, message, args) {

    await message.deferReply({ephemeral: true})

    let tournament_id = args.get("id").value

    let poster = args.get("poster") ? args.get("poster").value : null

    let date = new Date(args.get("date").value.split('-')[0].split('/')[2], args.get("date").value.split('-')[0].split('/')[1] - 1, args.get("date").value.split('-')[0].split('/')[0], args.get("date").value.split('-')[1].split(':')[0], args.get("date").value.split('-')[1].split(':')[1], args.get("date").value.split('-')[1].split(':')[2])

    let place = await bot.Places.findOne({ where: { place_id: args.get("place").value } })

    let embed = new Discord.EmbedBuilder()
      .setAuthor({ name: 'Ichigo - Sun After the Reign', iconURL: bot.user.displayAvatarURL(), url: bot.url})
      .setTitle(args.get("title").value)
      .setURL(bot.url)
      .setDescription(args.get("description").value.replaceAll("\\n", "\n"))
      .setImage(poster)
      .addFields(
        { name: ':small_orange_diamond: ID', value: tournament_id },
        { name: ':small_orange_diamond: Date', value: `Le <t:${Math.floor(date)/1000}:F>`},
        { name: ':small_orange_diamond: Lieu', value: `${place.dataValues.place_name}, ${place.dataValues.place_city}` },
        { name: ':small_orange_diamond: Règlement', value: `${args.get("ruleset").value}`},
        { name: ':small_orange_diamond: Format', value: `${args.get("format").value}`},
        { name: ':small_orange_diamond: Challonge', value: "https://challonge.com/" + tournament_id },
      )

    let row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId("confirm-tournament")
          .setLabel("Confirmer")
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId("cancel-tournament")
          .setLabel("Annuler")
          .setStyle(Discord.ButtonStyle.Danger)
      )
    let collector = message.channel.createMessageComponentCollector({time: 30000, max: 1})
    message.editReply({embeds: [embed], components: [row]})

    collector.on('collect', async i => {
      await i.deferUpdate()
      if (i.customId === 'confirm-tournament') {

        let challonge = ""

        if (args.get("format").value != "Training"){

          let myHeaders = new Headers()
          myHeaders.append("Accept", "application/json")
          myHeaders.append("Authorization-Type", "v1")
          myHeaders.append("Authorization", bot.challonge)
          myHeaders.append("Content-Type", "application/vnd.api+json")

          let raw = JSON.stringify({
            "data": {
              "type": "tournament",
              "attributes": {
                "name": args.get("title").value,
                "url": tournament_id,
                "tournament_type": args.get("format").value == "Double Élimination" ? "double elimination" : "single elimination",
                "game_name": "Beyblade X",
                "starts_at": new Date(date).toDateString(),
                "description": `<p>${args.get("description").value.replaceAll("\\n", "\n")}</p><br><p>Règlement : ${args.get("ruleset").value} (<a href="https://drive.google.com/file/d/1agZf01RlWYBnfRjCcysJJct4mCZVLnIb/view?usp=drive_link" rel="nofollow">plus de détails ici</a>)</p><p>Format : ${args.get("format").value}</p><p>Horaire : Le ${date.getDate()} ${["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"][date.getMonth()]} à partir de ${date.toTimeString().substr(0, 5).replace(':', 'h')}</p><p>Localisation : ${place.dataValues.place_name}, ${place.dataValues.place_number} ${place.dataValues.place_road}, ${place.dataValues.place_postcode}, ${place.dataValues.place_city}</p>` + (place.dataValues.place_access ? `<p>Accès : ${place.dataValues.place_access}</p>` : "") + `<br><p>Toutes les informations sont disponibles sur notre <a href="https://discord.gg/afEvCBF9XR" rel="nofollow">Discord</a>.</p>`,
                "registration_options": { "open_signup": true },
                "station_options": { "auto_assign": true },
              }
            }
          })

          let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          }         

          let res = await fetch("https://api.challonge.com/v2.1/tournaments.json?community_id=sunafterthereign", requestOptions)
          let data = await res.json()
          challonge = data.data.id
        }

        if (args.get("date_pub")){   
          prog = new Date(args.get("date_pub").value.split('-')[0].split('/')[2], args.get("date_pub").value.split('-')[0].split('/')[1] - 1, args.get("date_pub").value.split('-')[0].split('/')[0], args.get("date_pub").value.split('-')[1].split(':')[0], args.get("date_pub").value.split('-')[1].split(':')[1], args.get("date_pub").value.split('-')[1].split(':')[2])
          await i.editReply({ content: `Tournament creation confirmed, waiting to post the __<t:${Math.floor(prog) / 1000}:d> at <t:${Math.floor(prog) / 1000}:T> (<t:${Math.floor(prog) / 1000}:R>)__.`, components: [], ephemeral: true })
        } else prog = new Date(parseInt(Math.floor(Date.now()+1000)))

        new cron.CronJob(prog, async () => {


          console.log("LANCEMENT DU CRONJOB")

          let tournament = await bot.Tournaments.create({
            tournament_id: tournament_id,
            tournament_name: args.get("title").value,
            tournament_desc: args.get("description").value.replaceAll("\\n", "\n"),
            tournament_date: Math.floor(date) / 1000,
            tournament_ruleset: args.get("ruleset").value,
            tournament_format: args.get("format").value,
            tournament_place: args.get("place").value,
            tournament_message: "",
            tournament_role: "",
            tournament_poster: poster,
            tournament_status: "Inscriptions en cours",
            tournament_challonge: challonge,
            tournament_season: bot.season,
            tournament_published: "false",
          })

          console.log("CREATION DU TOURNOI DANS DB")

          let event = await message.guild.scheduledEvents.create({
            name: args.get("title").value,
            scheduledStartTime: new Date(parseInt(Math.floor(date))),
            scheduledEndTime: new Date(parseInt(Math.floor(date)) + (3600 * 5)),
            privacyLevel: 2,
            entityType: 3,
            image: poster,
            description: args.get("description").value.replaceAll("\\n", "\n"),
            entityMetadata: { location: `${place.dataValues.place_name}, ${place.dataValues.place_city}` },
          })

          console.log("CREATION EVENT")

          let role = await message.guild.roles.create({
            name: "Participants "+args.get("title").value,
            color: "32ECE0",
            permissions : "0",
          })

          console.log("CREATION ROLE")

          let post = await require(`../events/.postTournamentEmbed.js`).run(bot, tournament)
          await bot.Tournaments.update({ tournament_message: post.id, tournament_event: event.id, tournament_role: role.id}, { where: { tournament_id: tournament_id }})

          await require(`../events/.publishTournament.js`).run(bot, tournament_id, args.get("post_pub").value)
          
          return i.editReply({content: `Tournament **${args.get("title").value}** created with id : **${tournament_id}**.`, components: [], ephemeral: true})
        }).start()

      } else if (i.customId === 'cancel-tournament') {
        return i.editReply({content: 'Tournament creation canceled.', components: [], ephemeral: true})
      }
    })
  }
}
