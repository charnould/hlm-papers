import * as fs from 'fs'
import * as cheerio from 'cheerio'
import { save_article } from '../models.js'
import { is_relevant, delay } from '../helpers.js'
import { eachDayOfInterval, format, formatISO, getYear } from 'date-fns'

console.log('//////////// LE PARISIEN ////////////')

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('./scraping/update.json'))
const last_update = update_file['leparisien']
let missing_days = eachDayOfInterval({
  start: last_update,
  end: Date.now(),
})
console.log(missing_days)

// Pour chaque jour non-scrapé :
for (const day of missing_days) {
  // Attendre quelques secondes, requêter l'URL et préparer le parsing
  await delay(500)

  const url_to_fetch = `https://www.leparisien.fr/archives/${getYear(day)}/${format(day, 'dd-MM-yyyy', new Date())}/`

  const response = await fetch(url_to_fetch)

  const body = await response.text()
  const $ = cheerio.load(body)

  console.log(url_to_fetch)

  // Pour chaque "article" de la page...
  $('div.story-preview > div > a').each((id, ref) => {
    // ... récupérer les éléments souhaités
    const el = $(ref)
    const title = el.find('span').text().trim()
    const url_article = el.attr('href').trim()

    // Et si l'article est pertinent...
    if (is_relevant(title) === true) {
      const article = {
        title: title,
        snippet: null,
        url: url_article,
        query: url_to_fetch,
        publisher: 'www.leparisien.fr',
        published_on: formatISO(day),
        location: null,
      }
      // ...le sauvegarder dans la base de données
      save_article(article)
    }
  })
}

// Mettre à jour le fichier de suivi des updates
update_file['leparisien'] = Date.now()
fs.writeFileSync('./scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
