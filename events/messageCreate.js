module.exports = async (bot, message) => {

  if (message.author.bot) return

  if (message.content.startsWith('!') && message.content.slice(1) in bot.tags) message.channel.send(bot.tags[message.content.slice(1)])
}
