const { request } = require('undici')

module.exports = {

  async run(bot, community, tournament) {

    let requestOptions = { method: 'GET', headers: bot.myHeaders, redirect: 'follow' }
    let request = await fetch("https://api.challonge.com/v2.1/tournaments/" + tournament.dataValues.tournament_challonge + "/participants.json?community_id=" + community + "&per_page=200", requestOptions)

    let participants = await request.json()
    let users = participants.included.filter(u => u.type === "user")

    for (let participant of participants.data) {

      let user = users.find(u => u.attributes.username === participant.attributes.username)

      let clan = participant.attributes.name.includes(" | ") ? participant.attributes.name.split(" | ")[0] : ""
      let displayname = participant.attributes.name.includes(" | ") ? participant.attributes.name.replaceAll(/[\p{Emoji_Modifier_Base}\p{Emoji_Component}\p{Emoji_Presentation}\p{Emoji}]/gu, '').split(" | ")[1] : participant.attributes.name.replaceAll(/[\p{Emoji_Modifier_Base}\p{Emoji_Component}\p{Emoji_Presentation}\p{Emoji}]/gu, '')
      let username = user ? user.attributes.username : displayname
     
      await bot.Bladers.upsert({
        blader_username: username,
        blader_organization: tournament.dataValues.tournament_organization,
        blader_displayname: displayname,
        blader_clan: clan,
        blader_avatarurl: user?.attributes.image_url,
      }, { where: { blader_username: username, blader_organization: tournament.dataValues.tournament_organization } }, conflictFields = ['blader_username', 'blader_organization'])

      await bot.Participations.upsert({
        participation_id: participant.id,
        participation_tournament: tournament.dataValues.tournament_id,
        participation_username: username,
      }, { where: { participation_id: participant.id } })

    }
    return
  }
}
