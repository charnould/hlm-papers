import * as fs from 'fs'
import * as cheerio from 'cheerio'
import { save_article } from '../models.js'
import { is_relevant, delay } from '../helpers.js'
import { eachDayOfInterval, format } from 'date-fns'

console.log('//////////// LE FIGARO ////////////')

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('./scraping/update.json'))
const last_update = update_file['lefigaro']
let missing_days = eachDayOfInterval({
  start: last_update,
  end: Date.now(),
})
missing_days = missing_days.map((d) => format(d, 'dd-MM-yyy'))
console.log(missing_days)

const urls = [
  'https://recherche.lefigaro.fr/recherche/logement/?type=ART&page=1', // pas de différence avec logementS
  'https://recherche.lefigaro.fr/recherche/logement/?type=ART&page=2',
  'https://recherche.lefigaro.fr/recherche/bailleur/?type=ART&page=1', // pas de différence avec bailleurS
  'https://recherche.lefigaro.fr/recherche/bailleur/?type=ART&page=2',
  'https://recherche.lefigaro.fr/recherche/hlm/?type=ART&page=1',
  'https://recherche.lefigaro.fr/recherche/hlm/?type=ART&page=2',
]

// Pour chaque URLs...
for (const url of urls) {
  // ... et pour chaque jour non-scrapé :
  for (const day of missing_days) {
    // 1) Attendre quelques secondes, requêter l'URL et préparer le parsing
    await delay(4000)
    const url_to_fetch = `${url}&datemin=${day}&datemax=${day}`
    const response = await fetch(url_to_fetch)
    const body = await response.text()
    const $ = cheerio.load(body)

    console.log(`${url}&datemin=${day}&datemax=${day}`)

    // Pour chaque "article" de la page...
    $('article').each((id, ref) => {
      // ... récupérer les éléments souhaités
      const el = $(ref)
      const title = el.find('h2').text().trim()
      const snippet = el.find('.fig-profil-chapo').text().trim()
      const url_article = el.find('a').attr('href').trim()
      const published_on = el.find('time').attr('datetime').trim()

      // Et si l'article est pertinent...
      if (is_relevant(title) === true) {
        const article = {
          title: title,
          snippet: snippet,
          url: url_article,
          query: url,
          publisher: 'www.lefigaro.fr',
          published_on: published_on,
          location: null,
        }
        // ...le sauvegarder dans la base de données
        save_article(article)
      }
    })
  }
}

// Mettre à jour le fichier de suivi des updates
update_file['lefigaro'] = Date.now()
fs.writeFileSync('./scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
