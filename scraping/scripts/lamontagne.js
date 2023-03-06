import * as fs from 'fs'
import * as cheerio from 'cheerio'
import { save_article } from '../models.js'
import { is_relevant, delay } from '../helpers.js'
import { eachDayOfInterval, format, formatISO } from 'date-fns'

console.log('//////////// LA MONTAGNE ////////////')

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('./scraping/update.json'))
const last_update = update_file['lamontagne']
let missing_days = eachDayOfInterval({
  start: last_update,
  end: Date.now(),
})
console.log(missing_days)

const urls = [
  'https://www.lamontagne.fr/recherche.html?&uidSite=1&searchTypes=&pageNumber=&sort=TRI_DATE_DESC&idCommune=&resultPageNumber=0&query=hlm',
  'https://www.lamontagne.fr/recherche.html?&uidSite=1&searchTypes=&pageNumber=&sort=TRI_DATE_DESC&idCommune=&resultPageNumber=0&query=logement',
  'https://www.lamontagne.fr/recherche.html?&uidSite=1&searchTypes=&pageNumber=&sort=TRI_DATE_DESC&idCommune=&resultPageNumber=0&query=bailleur',
]

for (const url of urls) {
  // Pour chaque jour non-scrapé
  for (const day of missing_days) {
    // Attendre quelques secondes, requêter l'URL et préparer le parsing
    await delay(250)
    const url_to_fetch = url + `&datePublication.debut=${format(day, 'dd/MM/yyyy', new Date())}&datePublication.fin=${format(day, 'dd/MM/yyyy', new Date())}`
    const response = await fetch(url_to_fetch, { method: 'POST' })
    const body = await response.text()
    const $ = cheerio.load(body)
    console.log(url_to_fetch)

    // Pour chaque "article" de la page...
    $('.head-article').each((id, ref) => {
      // ... récupérer les éléments souhaités
      const el = $(ref)
      const title = el.find('a').text().trim()
      const url_article = el.find('a').attr('href').trim()
      const snippet = el.find('.texte-content').text().trim()

      // Et si l'article est pertinent...
      if (is_relevant(title) === true) {
        const article = {
          title: title,
          snippet: snippet,
          url: `https://www.lamontagne.fr${url_article}`,
          query: url_to_fetch,
          publisher: 'www.lamontagne.fr',
          published_on: formatISO(day, new Date()),
          location: null,
        }
        // ...le sauvegarder dans la base de données
        save_article(article)
      }
    })
  }
}

// Mettre à jour le fichier de suivi des updates
update_file['lamontagne'] = Date.now()
fs.writeFileSync('./scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
