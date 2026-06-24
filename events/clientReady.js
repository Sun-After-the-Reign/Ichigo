const Sequelize = require("sequelize")
const slashcommands_loader = require("../slashcommands_loader")

module.exports = async bot => {

  console.log(`Connected as ${bot.user.tag}!`)

  bot.tags = {
    "discord" : "https://discord.gg/afEvCBF9XR",
    "tiktok": "https://www.tiktok.com/@sunafterthereign",
    "instagram": "https://www.instagram.com/sunafterthereign",
    "twitter": "https://x.com/SunAfterTheBey",
    "youtube": "https://www.youtube.com/@SunAftertheReign",
    "liens": "https://sunafterthereign.carrd.co",
    "data" : "Base de données des produits Beyblade X : https://docs.google.com/spreadsheets/d/1Wshh88T0oDORXXr4F7xVYK0cjBRMXYJE5KzoPjss_no",
    "tournoi": "Sun After the Reign organise un tournoi tous les mois, le Beyblade Battle Tournament. Si une date n'est pas encore annoncée, alors ça arrivera bientôt dans https://discord.com/channels/1221611301332193371/1255960593563910306",
  }

  bot.regles = {
    "générales": "# **Règles générales liées aux tournois Beyblade X :**\n- Tournoi **Beyblade X**, joué avec des toupies et équipements Beyblade X.\n- **Tournois ouverts à tout âge**, merci de rester poli et courtois avec vos adversaires.\n- Vous pouvez emprunter de l'équipement à un autre joueur si il est d'accord mais soyez certain de le rendre en temps et en heure ainsi qu'en bonne condition.\n- Pour des raisons techniques, le **bit Metal Needle (MN) est banni** afin de ne pas endommager les Stadiums.\n\nLes règles ci-dessous sont à prendre en connaissance avant chaque tournoi et peuvent être sujettes à modification, selon les décisions du staff ⬇️",
    "3on3": "# Déroulement d'un match __3on3__\n  - Chaque joueur assemble **3 toupies** en n'utilisant **aucun composant en double** parmi celles-ci.\n  - Ensuite le joueur désigne un ordre pour chacune de ses toupies, **n°1 n°2 et n°3**.\n  - Puis le joueur donne ses toupies, dans l'ordre, à l'arbitre afin qu'il procède à une vérification et puisse fournir à chaque battle les 2 toupies aux joueurs.\n  - Enfin, le joueur déclare qu'il est prêt et présente ses lanceurs à l'arbitre.\n\n- Le match est joué en 4 points gagnants, dans l'ordre des toupies, avec les règles suivantes :\n  - **EXTREME FINISH** : 3 points\n  - **OVER FINISH** : 2 points\n  - **BURST FINISH** : 2 points\n  - **SPIN FINISH** : 1 point\n- Si au bout de 3 battles aucun des joueurs n'a obtenu 4 points, on décide alors d'un nouvel ordre de toupies et le match continue jusqu'à ce qu'un des joueurs obtienne 4 points.",
    "3vs3": "# Déroulement d'un match __Team Battle__\n  - Une équipe est composée de 3 joueurs, qui chacun assemble **1 toupie** en n'utilisant **aucun composant en double** parmi les 3 toupies de l'équipe.\n  - Ensuite l'équipe désigne un ordre pour chacun de ses joueurs et leur toupie, **n°1 n°2 et n°3**.\n  - Puis l'équipe donne ses toupies, dans l'ordre, à l'arbitre afin qu'il procède à une vérification et puisse fournir à chaque set les 2 toupies aux joueurs.\n  - Enfin, l'équipe déclare qu'elle est prête et présente ses lanceurs à l'arbitre.\n  - Les joueurs de l'équipe affronte alors un joueur de l'équipe adverse selon son ordre, dans un set, avec sa toupie.\n\n- Les sets sont joués en 2 points gagnants, avec les règles suivantes :\n  - **EXTREME FINISH** : 3 points\n  - **OVER FINISH** : 2 points\n  - **BURST FINISH** : 2 points\n  - **SPIN FINISH** : 1 point\n - Le perdant du set est éliminé du match et laisse la place au joueur suivant de son équipe, le gagnant quant à lui continue à jouer.\n - L'équipe qui élimine tous les joueurs de l'équipe adverse est déclarée vainqueur.",
    "2vs2": "# Déroulement d'un match __2vs2__\n  - Une équipe est composée de 2 joueurs, qui chacun assemble **1 toupie** en n'utilisant **aucun composant en double** parmi les 2 toupies de l'équipe.\n  - Ensuite l'équipe désigne un ordre pour chacun de ses joueurs et leur toupie, **n°1 puis n°2**.\n  - Puis l'équipe donne ses toupies, dans l'ordre, à l'arbitre afin qu'il procède à une vérification et puisse fournir à chaque set les 2 toupies aux joueurs.\n  - Enfin, l'équipe déclare qu'elle est prête et présente ses lanceurs à l'arbitre.\n  - Les joueurs de l'équipe affronte alors un joueur de l'équipe adverse selon son ordre, dans un set, avec sa toupie.\n\n- Les sets sont joués en 2 points gagnants, avec les règles suivantes :\n  - **EXTREME FINISH** : 3 points\n  - **OVER FINISH** : 2 points\n  - **BURST FINISH** : 2 points\n  - **SPIN FINISH** : 1 point\n - Le perdant du set est éliminé du match et laisse la place au joueur suivant de son équipe, le gagnant quant à lui continue à jouer.\n - L'équipe qui élimine tous les joueurs de l'équipe adverse est déclarée vainqueur.",
    "1on1": "# Déroulement d'un match __1on1__\n - Chaque joueur assemble **1 toupie**.\n - Puis le joueur déclare qu'il est prêt et présente sa toupie ainsi que son lanceur à l'arbitre pour vérification.\n\n- Le match est joué en 4 points gagnants avec les règles suivantes :\n  - **EXTREME FINISH** : 3 points\n  - **OVER FINISH** : 2 points\n  - **BURST FINISH** : 2 points\n  - **SPIN FINISH** : 1 point\n",
    "banlist-3on3" : ".",
    "banlist-team": ".",
    "banlist-2vs2": ".",
    "banlist-1on1": ".",
    "ruleset-p1" : ".",
    "ruleset-p2" : ".",
    "ruleset-p3" : ".",
    "ruleset-p4": ".",
    "complément": "# **Règles complémentaires des évènements Sun After the Reign :**\n- **Tout le monde est convié**, même ceux qui ne souhaitent pas prendre part aux évènements et qui veulent seulement observer.\n  -# Du free-play est également organisé pendant les évènements.\n- La consommation sur place est **obligatoire** pour valider votre inscription au tournoi.\n- **Nous serons intransigeants sur votre attitude quant au respect des règles et au respect que vous aurez vis-à-vis de vos adversaires ou des organisateurs.**\n- **Toute insulte, manque de respect ou moquerie mènera inéluctablement à votre disqualification puis exclusion des évènements.**\n- Par soucis de sécurité, l'accès à la Battle-Zone est autorisé **uniquement** pour les **joueurs devant y jouer**, les **staffs** et exceptionnellement pour un **parent accompagnateur**. Votre présence sans motif dans la Battle-Zone mènera à des **sanctions**. Si vous souhaitez filmer votre match, merci de prévoir un trépied ou de confier un appareil de capture à l'arbitre.\n  - En cas de disqualification, **aucun remboursement** de consommation ne pourra être demandé à l'organisme qui accueille l'évènement.\n- La participation à nos évènements donne, par défaut, le droit aux organisateurs les droits d'utilisation des images des participants prises lors des évènements, sur tous supports et pour toutes formes de diffusion. Ces images pourront être utilisées à des fins de promotion, de communication ou de reportage sur l'évènement.\n- Tout mineur participant à nos évènements doit être accompagné d'un adulte présent sur place, à défaut de pouvoir fournir une autorisation parentale."
  }

  bot.db = new Sequelize({
    dialect: "sqlite",
    storage: "./ichigo.db",
    logging: false,
  })

  bot.Tournaments = bot.db.define("tournament", {
    tournament_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    tournament_name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    tournament_desc: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_ruleset: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_format: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_place: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_role: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_season: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_poster: {
      type: Sequelize.STRING,
    },
    tournament_status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_challonge: {
      type: Sequelize.STRING,
    },
    tournament_first: {
      type: Sequelize.STRING,
    },
    tournament_second: {
      type: Sequelize.STRING,
    },
    tournament_third: {
      type: Sequelize.STRING,
    },
    tournament_event: {
      type: Sequelize.STRING,
    },
    tournament_participants: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "auto",
    },
    tournament_published: {
      type: Sequelize.STRING,
    },
  })
  bot.Inscriptions = bot.db.define("inscription", {
    inscription_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    player_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tournament_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    player_status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })
  bot.Places = bot.db.define("place", {
    place_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    place_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_road: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_postcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_maps: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_info: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_inscr: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    place_access: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  })
  bot.Bladers = bot.db.define("blader", {
    blader_username: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    blader_displayname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    blader_clan: {
      type: Sequelize.STRING,
    },
    blader_avatarurl: {
      type: Sequelize.STRING,
    },
  })
  bot.Participations = bot.db.define("participation", {
    participation_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    participation_tournament: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    participation_username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  await bot.Tournaments.sync()
  await bot.Inscriptions.sync()
  await bot.Places.sync()
  await bot.Bladers.sync()
  await bot.Participations.sync()
  console.log("Database Online.")

  await slashcommands_loader(bot)

  bot.user.setPresence({activities: [{ name: "Arbitrer les matchs du BBT.", type: 0 }], status: "online"})

}
