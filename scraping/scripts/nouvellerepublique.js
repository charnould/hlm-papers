// Dépendances
import * as fs from 'fs'
import { save_article } from '../models.js'
import { is_relevant, delay } from '../helpers.js'
import { eachDayOfInterval, format, formatISO } from 'date-fns'

console.log('//////////// LA NOUVELLE REPUBLIQUE ////////////')

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('./scraping/update.json'))
const last_update = update_file['nouvellerepublique']
let missing_days = eachDayOfInterval({
  start: last_update,
  end: Date.now(),
})
missing_days = missing_days.map((d) => format(d, 'yyyy-MM-dd'))
console.log(missing_days)

const urls = [
  'https://www.lanouvellerepublique.fr/api/v1/search?&lang=fr&limit=1000&query=hlm&predefinedFacets=',
  'https://www.lanouvellerepublique.fr/api/v1/search?&lang=fr&limit=1000&query=bailleur&predefinedFacets=',
  'https://www.lanouvellerepublique.fr/api/v1/search?&lang=fr&limit=1000&query=bailleurs&predefinedFacets=',
  'https://www.lanouvellerepublique.fr/api/v1/search?&lang=fr&limit=1000&query=logement&predefinedFacets=',
  'https://www.lanouvellerepublique.fr/api/v1/search?&lang=fr&limit=1000&query=logements&predefinedFacets=',
  'https://www.lanouvellerepublique.fr/api/v1/search?&lang=fr&limit=1000&query=HLM&predefinedFacets=',
]

// Pour chaque URLs...
for (const url of urls) {
  // ... et pour chaque jour non-scrapé :
  for (const day of missing_days) {
    // 1) Attendre quelques secondes, requêter l'URL et préparer le parsing
    await delay(100)
    const url_to_fetch = `${url}{"dateParution":"${day}T00:00:00.000Z-${day}2T23:59:59.999Z"}`
    const response = await fetch(url_to_fetch)
    const body = await response.text()
    const articles = await JSON.parse(body).results.data
    console.log(url_to_fetch)

    // Pour chaque article...
    for (const article of articles) {
      // ... S'il est pertinent...

      if (is_relevant(article.title) === true) {
        const data = {
          title: article.title,
          snippet: article.text_all,
          url: `www.lanouvellerepublique.fr${article.canonical}`,
          query: url_to_fetch,
          publisher: 'www.lanouvellerepublique.fr',
          published_on: formatISO(article.dateParution),
          location: null,
        }
        // ...le sauvegarder dans la base de données
        save_article(data)
      }
    }
  }
}

// Mettre à jour le fichier de suivi des updates
update_file['nouvellerepublique'] = Date.now()
fs.writeFileSync('./scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
