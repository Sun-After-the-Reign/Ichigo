const { request } = require('undici')

module.exports = {

  async run(bot, tournaments) {

    let classement = {}

    let bans = await bot.Bans.findAll({})
    let bannis = bans.map(ban => ban.dataValues.ban_name)

    for (tournament of tournaments) {

      let req = await request(`https://api.challonge.com/v1/tournaments/${tournament.dataValues.tournament_challonge}.json?include_participants=1&include_matches=1&api_key=${bot.challonge}`)
      let challonge = await req.body.json()

      for (participant of challonge.tournament.participants) {

        let blader = participant.participant

        if (!bannis.includes(blader.name)){

          if (classement[blader.name]) classement[blader.name]["participations"] += 1
          else {
            classement[blader.name] = {}

            classement[blader.name]["participations"] = 1
            classement[blader.name]["W"] = 0
            classement[blader.name]["L"] = 0

            classement[blader.name]["points"] = 0
            classement[blader.name]["wins"] = 0
          }

          if (blader.final_rank == 1) classement[blader.name]["wins"] += 1

          for (matches of challonge.tournament.matches) {

            let match = matches.match

            if (match.scores_csv.length == 3 && match.scores_csv != "0-0") {
              if (blader.id == match.loser_id) {
                classement[blader.name]["points"] += Math.min(...match.scores_csv.split("-").map(Number))
              }
            }
            if (blader.id == match.winner_id) {
              classement[blader.name]["W"] += 1
              classement[blader.name]["points"] += 4
            }
            if (blader.id == match.loser_id) classement[blader.name]["L"] += 1
          }
        }
      }
    }

    var items = Object.keys(classement).map(function (blader) { 
      // t'auras rien Yoyo pour cette saison
    })

    items.sort(function (a, b) { return a[1] != b[1] ? b[1] - a[1] : a[2] != b[2] ? b[2] - a[2] : a[3]["participations"] != b[3]["participations"] ? b[3]["participations"] - a[3]["participations"] : b[0] - a[0] })

    return items
  }
}
