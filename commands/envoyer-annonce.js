const Discord = require("discord.js")
const cron = require("cron")

module.exports = {

  name: "envoyer-annonce",
  description: "Envoie une annonce",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Message",
  options: [
    {
      type: "string",
      name: "annonce",
      description: "l'annonce à envoyer",
      required: true,
      autocomplete: true,
    },
    {
      type: "string",
      name: "tournament_id",
      description: "le tournoi en rapport avec l'annonce",
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
    {
      type: "string",
      name: "option",
      description: "option supplémentaire",
      required: false,
      autocomplete: false,
    },
  ],

  async run(bot, message, args) {
    
    let id = args.get("tournament_id").value.split(" - ")[0]
    let tournament = await bot.Tournaments.findOne({ where: { tournament_id: id } })
    if (!tournament) return await message.reply({ content: "Le tournoi fourni n'est pas valide.", ephemeral: true })

    let place = await bot.Places.findOne({ where: { place_id: tournament.dataValues.tournament_place } })

    let option = args.get("option") ? args.get("option").value : ""
    let ping = tournament.dataValues.tournament_role
    let title = tournament.dataValues.tournament_name

    let annonces = {
      "Rappel": `-# <@&${ping}>\n## Rappel concernant le __${title.toUpperCase()}__ à ${place.dataValues.place_name.toUpperCase()}, ${place.dataValues.place_number} ${place.dataValues.place_road} à ${place.dataValues.place_city}.\n\n- À PARTIR DE **12h30** :\n  - Accueil des joueurs, c'est le moment de prendre votre **consommation obligatoire (Pass Beyblade)** pour participer.\n  - Début des inscriptions, merci de venir vous inscrire avec votre **bracelet / preuve d'achat** de votre consommation.\n  - Merci de bien nous indiquer directement si vous êtes déjà inscrit sur Challonge, ou si vous souhaitez le faire à cet instant.\n  -# L'inscription sur Challonge est obligatoire pour obtenir un classement, mais une inscription avec un simple nom de Blader sur place est toujours possible.\n- À **13h30** :\n  - Fin des inscriptions et génération de l'arbre des matchs du tournoi.\n  - Discours de début de tournoi, point sur l'organisation et sur les règles.\n- VERS **14h00**\n  - Début des matchs\n  -# Pour vous organiser, les matchs seront joués **dans l'ordre numérique** du [**Challonge**](https://challonge.com/${id}).\n- AUTOUR DE **19h30**\n  - Fin des matchs et remise des prix.\n  - Discours de fin et fin de l'événement.\n### Attention ! Nous n'attendrons pas les retardataires, afin de ne pas bousculer l'organisation des matchs. Nous clôturerons les inscriptions à 13h30.\nEn attendant merci de bien relire https://discord.com/channels/1221611301332193371/1221671605348864031, et de suivre https://discord.com/channels/1221611301332193371/1221670844279947316 pour ne rien rater.`,
      "Rappel2": `-# @everyone\n## Rappel concernant le __${title.toUpperCase()}__ à ${place.dataValues.place_name.toUpperCase()}, ${place.dataValues.place_number} ${place.dataValues.place_road} à ${place.dataValues.place_city}.\n\n- À PARTIR DE **12h30** :\n  - Accueil des joueurs, c'est le moment de prendre votre **consommation obligatoire (Pass Beyblade)** pour participer.\n  - Début des inscriptions, merci de venir vous inscrire **EN ÉQUIPE DE 3 COMPLÈTE** avec vos **bracelets / preuves d'achat** de vos consommation.\n  - Merci de monter à l'étage uniquement une fois votre équipe entièrement constituée et de réserver le RDC pour les recrutements de dernière minute.\n  -# Aucune équipe ne sera inscrite si elle n'est pas composée de 3 bladers.\n  - Merci de bien nous indiquer directement si vous êtes déjà inscrit sur Challonge, ou si vous souhaitez le faire à cet instant.\n- À **13h30** :\n  - Fin des inscriptions et génération de l'arbre des matchs du tournoi.\n  - Discours de début de tournoi, point sur l'organisation et sur les règles.\n- VERS **14h00**\n  - Début des matchs\n  -# Pour vous organiser, les matchs seront joués **dans l'ordre numérique** du [**Challonge**](https://challonge.com/${id}).\n- AUTOUR DE **19h30**\n  - Fin des matchs et remise des prix.\n  - Discours de fin et fin de l'événement.\n### Attention ! Nous n'attendrons pas les retardataires, afin de ne pas bousculer l'organisation des matchs. Nous clôturerons les inscriptions à 13h30.\nEn attendant merci de bien relire https://discord.com/channels/1221611301332193371/1221671605348864031, et de suivre https://discord.com/channels/1221611301332193371/1221670844279947316 pour ne rien rater.`,
      "Guide": `-# <@&${ping}>\n## Voici un guide étape par étape concernant l'inscription au __${title.toUpperCase()}__.\n\n1. Se rendre à **${place.dataValues.place_name.toUpperCase()}**, ${place.dataValues.place_number} ${place.dataValues.place_road}, ${place.dataValues.place_postcode}, ${place.dataValues.place_city}.\n2. Prendre sa consommation au bar (Pass Beyblade).\n-# À défaut d'obtenir un bracelet par le barman en guise de preuve d'achat, pensez à demander et conserver le ticket de caisse, il vous servira à valider votre inscription.\n3. Se rendre dans la salle du tournoi et faire la queue pour rencontrer les arbitres.\n4. Les arbitres vous inscrivent, pour cela, merci de nous indiquer :\n  1. Si vous êtes déjà inscrit sur Challonge.\n  2. Votre nom sur Challonge (à défaut, le nom de Blader que vous souhaitez utiliser).\n  3. Votre bracelet / ticket de preuve d'achat d'une consommation.\n5. Une fois le tout validé, vous êtes inscrit au tournoi Beyblade !\n6. Vous pouvez désormais faire un peu de free-play pour vous entraîner, mais restez vigilant à quand on vous appellera.`,
      "Guide2": `-# <@&${ping}>\n## Voici un guide étape par étape concernant l'inscription au __${title.toUpperCase()}__.\n\n1. Se rendre à **${place.dataValues.place_name.toUpperCase()}**, ${place.dataValues.place_number} ${place.dataValues.place_road}, ${place.dataValues.place_postcode}, ${place.dataValues.place_city}.\n2. Prendre sa consommation au bar (Pass Beyblade).\n-# À défaut d'obtenir un bracelet par le barman en guise de preuve d'achat, pensez à demander et conserver le ticket de caisse, il vous servira à valider votre inscription.\n3. Se rendre dans la salle du tournoi **avec votre équipe complète** et faire la queue pour rencontrer les arbitres.\n4. Les arbitres vous inscrivent, pour cela, merci de nous indiquer :\n  1. Si vous êtes déjà inscrit sur Challonge.\n  2. Le nom de votre équipe et ses membres.\n  3. Vos bracelets / tickets de preuve d'achat d'une consommation.\n5. Une fois le tout validé, vous êtes inscrit au tournoi Beyblade !\n6. Vous pouvez désormais faire un peu de free-play pour vous entraîner, mais restez vigilant à quand on vous appellera.`,
      "Inscriptions": `-# <@&${ping}>\n## Les inscriptions sur place pour le __${title.toUpperCase()}__ sont ouvertes <:kamen_hype:1249459967015129139> \n\nPour rappel, voici un guide pour les inscriptions :arrow_right: ${option}\n-# Même inscrit en avance sur Challonge, rendez-vous au bureau pour valider votre inscription.\n\n**Merci de payer votre consommation (Pass Beyblade) et de venir vous inscrire le plus tôt possible.**`,
    }

    if (annonces[args.get("annonce").value]) {
      if (args.get("date")){     
        let datetime = new Date(args.get("date").value.split('-')[0].split('/')[2], args.get("date").value.split('-')[0].split('/')[1] - 1, args.get("date").value.split('-')[0].split('/')[0], args.get("date").value.split('-')[1].split(':')[0], args.get("date").value.split('-')[1].split(':')[1], args.get("date").value.split('-')[1].split(':')[2])
        new cron.CronJob(datetime, () => { message.channel.send(annonces[args.get("annonce").value] ) }).start()
        return await message.reply({ content: `C'est bon, l'annonce seront envoyées le __<t:${Math.floor(datetime) / 1000}:d> à <t:${Math.floor(datetime) / 1000}:T> (<t:${Math.floor(datetime) / 1000}:R>)__.`, ephemeral: true })
      } else {
        await message.channel.send(annonces[args.get("annonce").value] )
        return await message.reply({content: "C'est bon.", ephemeral: true})
      }
    } else return await message.reply({ content: "Pas de d'annonces disponibles à ce nom.", ephemeral: true })
  }
}
