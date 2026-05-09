module.exports = {

	async run(bot, id, post) {

		console.log("PUBLISH TOURNAMENT")

		let channel = await bot.channels.fetch(post)

		let tournament = await bot.Tournaments.findOne({ where: { tournament_id: id } })

		if (tournament.dataValues.tournament_published == "false") {

			console.log("LOGIC PUBLISH TOURNAMENT")

			let place = await bot.Places.findOne({ where: { place_id: tournament.dataValues.tournament_place } })
			let medias = []

			if (tournament.dataValues.tournament_poster) medias.push({ attachment: tournament.dataValues.tournament_poster })

			msg = "-# @everyone - Annonce nouveau tournoi !" + "\n"

			msg += "## " + tournament.dataValues.tournament_name.toUpperCase() + "\n"

			msg += "**" + tournament.dataValues.tournament_desc.toUpperCase() + "**"+ "\n"

			msg += "\n"

			msg += ":small_orange_diamond: **Informations** :small_orange_diamond:" + "\n"
				
			msg	+= "\n"

			msg += `:date: Date : Le <t:${tournament.dataValues.tournament_date}:D>, à partir de <t:${tournament.dataValues.tournament_date}:t> (<t:${tournament.dataValues.tournament_date}:R>)` + "\n"
			msg += `:map: Lieu : ${place.dataValues.place_name}, ${place.dataValues.place_city}` + "\n"
			msg += `:bar_chart: Format : ${tournament.dataValues.tournament_format}` + "\n"
			msg += `:scroll: Règlement : ${tournament.dataValues.tournament_ruleset}` + "\n"
			msg += `:globe_with_meridians: Lien : ${"https://challonge.com/" + tournament.dataValues.tournament_id }` + "\n"

			msg += "\n"

			msg += `-# Merci d'indiquer votre participation sur le Challonge afin que nous puissions estimer au mieux la taille du tournoi.`

			await channel.send({content : msg, files : medias})
			return await bot.Tournaments.update({ tournament_published: "true"}, { where: { tournament_id: tournament.dataValues.tournament_id }})
		}
		console.log("ALREADY PUBLISHED")
		return
	}
}
