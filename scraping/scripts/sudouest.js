import * as fs from 'fs'
import * as cheerio from 'cheerio'
import { save_article } from '../models.js'
import { is_url_relevant } from '../helpers.js'
import { eachMonthOfInterval, format } from 'date-fns'

console.log('//////////// SUD OUEST ////////////')

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('./scraping/update.json'))
const last_update = update_file['sudouest']
let missing_months = eachMonthOfInterval({
  start: last_update,
  end: Date.now(),
})
missing_months = missing_months.map((d) => format(d, 'yyyy-MM'))
console.log(missing_months)

// Pour chaque jour non-scrapé :
for (const month of missing_months) {
  const url_to_fetch = `https://www.sudouest.fr/sitemap/articles-${month}.xml`

  const response = await fetch(url_to_fetch)

  const body = await response.text()
  const $ = cheerio.load(body, { xmlMode: true })

  console.log(url_to_fetch)

  // Pour chaque "article" de la page...
  $('url').each((id, ref) => {
    // ... récupérer les éléments souhaités
    const el = $(ref)
    const url_article = el.find('loc').text()
    const published_on = el.find('lastmod').text()

    // Et si l'article est pertinent...
    if (is_url_relevant(url_article) === true) {
      const article = {
        title: url_article,
        snippet: null,
        url: url_article,
        query: url_to_fetch,
        publisher: 'www.sudouest.fr',
        published_on: published_on,
        location: null,
      }
      // ...le sauvegarder dans la base de données
      save_article(article)
    }
  })
}

// Mettre à jour le fichier de suivi des updates
update_file['sudouest'] = Date.now()
fs.writeFileSync('./scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
