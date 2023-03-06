import * as fs from 'fs'
import * as cheerio from 'cheerio'
import { format, parse, formatISO, eachDayOfInterval } from 'date-fns'
import { is_relevant, delay } from '../helpers.js'
import { save_article } from '../models.js'

console.log('//////////// ACTU.FR ////////////')

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('scraping/update.json'))
const last_update = update_file['actu']
let missing_days = eachDayOfInterval({
  start: last_update,
  end: Date.now(),
})
console.log(missing_days)

export const scrap_actu = async (response, query, date) => {
  const body = await response.text()
  const $ = cheerio.load(body)
  $('h2').each((id, ref) => {
    const el = $(ref).parent().parent()
    const content = el.text()

    if (is_relevant(content) === true) {
      const url = el.attr('href').trim()
      const title = el.find('h2').text().trim()
      const location = el.find('.ac-preview-article__footer span:nth-child(2)').text().trim()

      const article = {
        title: title,
        snippet: url,
        url: url,
        query: query,
        publisher: 'www.actu.fr',
        published_on: formatISO(parse(date, 'dd-MM-yyyy', new Date())),
        location: location,
      }

      save_article(article)
    }
  })
}

for (const day of missing_days) {
  let page = 0
  let is_there_another_page = true

  while (is_there_another_page === true) {
    const d1 = format(day, 'MM-yyyy')
    const d2 = format(day, 'dd-MM-yyyy')
    let url = `https://actu.fr/archives/${d1}/${d2}/page/${page}`
    const response = await fetch(url)

    if (response.ok) {
      console.log(url)
      scrap_actu(response, url, d2)
      await delay(500)
      page++
    } else {
      console.log(url)
      console.log("This page doesn't exist")
      is_there_another_page = false
    }
  }
}

// Mettre à jour le fichier de suivi des updates
update_file['actu'] = Date.now()
fs.writeFileSync('scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
