import * as fs from 'fs'
import { parse, formatISO, getYear, getMonth, format, eachDayOfInterval } from 'date-fns'
import { save_article } from '../models.js'
import { PuppeteerCrawler } from 'crawlee'
import { is_relevant } from '../helpers.js'

// Ugly helper
const format_month = (m) => {
  if (m === 0) return 'janvier'
  if (m === 1) return 'fevrier'
  if (m === 2) return 'mars'
  if (m === 3) return 'avril'
  if (m === 4) return 'mai'
  if (m === 5) return 'juin'
  if (m === 6) return 'juillet'
  if (m === 7) return 'aout'
  if (m === 8) return 'septembre'
  if (m === 9) return 'octobre'
  if (m === 10) return 'novembre'
  if (m === 11) return 'decembre'
  if (m === 'janvier') return '01'
  if (m === 'fevrier') return '02'
  if (m === 'mars') return '03'
  if (m === 'avril') return '04'
  if (m === 'mai') return '05'
  if (m === 'juin') return '06'
  if (m === 'juillet') return '07'
  if (m === 'aout') return '08'
  if (m === 'septembre') return '09'
  if (m === 'octobre') return '10'
  if (m === 'novembre') return '11'
  if (m === 'decembre') return '12'
}

// Retrouver depuis quand le scraping n'a pas eu lieu
const update_file = JSON.parse(fs.readFileSync('./scraping/update.json'))
const last_update = update_file['ouestfrance']

const generate_date = () => {
  let urls = []

  let missing_days = eachDayOfInterval({
    start: last_update,
    end: Date.now(),
  })

  missing_days.forEach((d) => {
    urls.push(`https://www.ouest-france.fr/archives/${getYear(d)}/${format(d, 'dd', new Date())}-${format_month(getMonth(d))}-${getYear(d)}/`)
  })

  return urls
}

console.log(generate_date())

const crawler = new PuppeteerCrawler({
  maxConcurrency: 3,
  maxRequestsPerMinute: 5,
  launchContext: {
    launchOptions: {
      headless: true,
    },
  },

  async requestHandler({ request, page, enqueueLinks, log }) {
    log.info(`Processing ${request.url}...`)

    // Evaluated ** within ** the browser context
    let articles = await page.$$eval('article', ($posts) => {
      let scraped_data = []

      $posts.forEach(($post) => {
        scraped_data.push({
          title: $post.querySelector('h2').innerText.trim(),
          url: $post.querySelector('a').href.trim(),
          snippet: $post.querySelector('p').innerText.trim(),
        })
      })

      return scraped_data
    })

    // Find a link to the next page and enqueue it if it exists.
    const infos = await enqueueLinks({
      selector: '.pager-item > a',
    })

    if (infos.processedRequests.length === 0) log.info(`${request.url} is the last page!`)

    let date = request.url.split('/')[5].split('-')
    date = formatISO(parse(`${date[0]}-${format_month(date[1])}-${date[2]}`, 'dd-MM-yyyy', new Date()))

    articles.forEach((element) => {
      element.published_on = date
      element.query = request.url
      element.publisher = 'www.ouest-france.fr'
      element.location = null
    })

    articles = articles.filter((article) => is_relevant(article.title))

    for (const article of articles) {
      await save_article(article)
    }
  },
})

// Mettre à jour le fichier de suivi des updates
console.log('//////////// OUEST FRANCE ////////////')
await crawler.run(generate_date())
update_file['ouestfrance'] = Date.now()
fs.writeFileSync('./scraping/update.json', JSON.stringify(update_file))
console.log('Crawler finished 🎉')
process.exit()
