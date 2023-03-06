import { save_article } from '../models.js'
import { is_relevant, delay } from '../helpers.js'
import { parse, formatISO } from 'date-fns'

console.log('//////////// LE TELEGRAMME ////////////')

const urls = [
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=logements+sociaux',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=logement+social',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=logement',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=logements',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=HLM',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=hlm',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=bailleur',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=bailleurs',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=bailleur+social',
  'https://www.letelegramme.fr/recherche/recherche_voir_plus.php?f_precherche_recherche=bailleurs+sociaux',
]

// Pour chaque url...
for (const url of urls) {
  // Attendre quelques secondes, requêter l'URL et préparer le parsing
  await delay(7000)
  const response = await fetch(url)
  const body = await response.text()
  const articles = await JSON.parse(body).articles

  // Pour chaque article...
  for (const article of articles) {
    // ... S'il est pertinent...
    if (is_relevant(article.titre) === true) {
      const data = {
        title: article.titre,
        snippet: article.chapeau,
        url: `https://www.letelegramme.fr/${article.url}`,
        query: url,
        publisher: 'www.letelegramme.fr',
        published_on: formatISO(parse(article.date_creation.split(' ')[0], 'yyyy-MM-dd', new Date())),
        location: article.rubriques[0].titre,
      }
      // ...le sauvegarder dans la base de données
      save_article(data)
    }
  }

  console.log(url)
}

console.log('Crawler finished 🎉')
process.exit()
