const { request } = require('undici')

module.exports = {

  async run(bot, tournament) {
    let request = await fetch("https://api.challonge.com/v1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?api_key=" + bot.challonge)
    let participants = await request.json()

    for (item of participants) {

      let username = item.participant.username ? item.participant.username : item.participant.name

      let blader = await bot.Bladers.findOne({ where: { blader_username: username } })

      await bot.Bladers.upsert({
        blader_username: username,
        blader_displayname: item.participant.name.includes(" | ") ? item.participant.name.split(" | ")[1] : item.participant.name,
        blader_clan: item.participant.name.includes(" | ") ? item.participant.name.split(" | ")[0] : "",
        blader_avatarurl: item.participant.attached_participatable_portrait_url,
      }, { where: { blader_username: username } })

      await bot.Participations.upsert({
        participation_id: item.participant.id,
        participation_tournament: tournament.dataValues.tournament_id,
        participation_username: username,
      }, { where: { participation_id: item.participant.id } })

    }
    return
  }
}