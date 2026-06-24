import * as Discord from "discord.js"
import * as Sequelize from "sequelize"
import { google } from "googleapis"

export const name = "name"
export const sheet = "city"
export const baseSize = X
export const rawSize = Y

export function getAuth() {
  return new google.auth.GoogleAuth({ keyFile: "./options/google.json", scopes: ["https://www.googleapis.com/auth/spreadsheets"] })
}

export async function getTournaments(bot) {
  return true //list of tournaments
}

export async function computeRanking(bot, data) {
  let ranking = await Object.keys(data).map((blader) => { return secretFormula(x, xx, xxx) })
  return ranking.sort(function (a, b) { return a - b })
}

function secretFormula(x, xx, xxx) {
  return 1000 //return a blader computed score
}

export async function getValues(bot, classement, mode) {
  let values = []
  // register all values to publish to google sheets    
  return values
}

export async function publishTop(bot, classement, message) {
  return classement.toImage()
}