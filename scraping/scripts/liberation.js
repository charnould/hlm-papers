import * as fs from 'fs'
import * as cheerio from 'cheerio'
import { save_article } from '../models.js'
import { is_relevant, delay } from '../helpers.js'
import { eachDayOfInterval, format, parse, formatISO } from 'date-fns'

console.log('//////////// LIBERATION ////////////')

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('./scraping/update.json'))
const last_update = update_file['liberation']
let missing_days = eachDayOfInterval({
  start: last_update,
  end: Date.now(),
})
missing_days = missing_days.map((d) => format(d, 'yyyy/MM/dd/'))
console.log(missing_days)

// Pour chaque jour non-scrapé :
for (const day of missing_days) {
  // Attendre quelques secondes, requêter l'URL et préparer le parsing
  await delay(1500)
  const url_to_fetch = `https://www.liberation.fr/archives/${day}`
  const response = await fetch(url_to_fetch)
  const body = await response.text()
  const $ = cheerio.load(body)

  console.log(url_to_fetch)

  // Pour chaque "article" de la page...
  $('a').each((id, ref) => {
    // ... récupérer les éléments souhaités
    const el = $(ref)
    const title = el.find('h2').text().trim()
    const url_article = el.attr('href').trim()

    // Et si l'article est pertinent...
    if (is_relevant(title) === true) {
      const article = {
        title: title,
        snippet: null,
        url: `https://www.liberation.fr${url_article}`,
        query: url_to_fetch,
        publisher: 'www.liberation.fr',
        published_on: formatISO(parse(day, 'yyyy/MM/dd/', new Date())),
        location: null,
      }
      // ...le sauvegarder dans la base de données
      save_article(article)
    }
  })
}

// Mettre à jour le fichier de suivi des updates
update_file['liberation'] = Date.now()
fs.writeFileSync('./scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
