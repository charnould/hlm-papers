import { parse, formatISO } from 'date-fns'
import { save_article } from '../models.js'
import { PuppeteerCrawler } from 'crawlee'
import { is_relevant } from '../helpers.js'

const urls = [
  'https://www.charentelibre.fr/recherche/?query=hlm&page=0',
  'https://www.charentelibre.fr/recherche/?query=hlm&page=1',
  'https://www.charentelibre.fr/recherche/?query=hlm&page=2',
  'https://www.charentelibre.fr/recherche/?query=hlm&page=3',
  'https://www.charentelibre.fr/recherche/?query=hlm&page=4',
  'https://www.charentelibre.fr/recherche/?query=bailleur&page=0',
  'https://www.charentelibre.fr/recherche/?query=bailleur&page=1',
  'https://www.charentelibre.fr/recherche/?query=bailleur&page=2',
  'https://www.charentelibre.fr/recherche/?query=bailleur&page=3',
  'https://www.charentelibre.fr/recherche/?query=bailleur&page=4',
  'https://www.charentelibre.fr/recherche/?query=social&page=0',
  'https://www.charentelibre.fr/recherche/?query=social&page=1',
  'https://www.charentelibre.fr/recherche/?query=social&page=2',
  'https://www.charentelibre.fr/recherche/?query=social&page=3',
  'https://www.charentelibre.fr/recherche/?query=social&page=4',
  'https://www.charentelibre.fr/recherche/?query=logement&page=0',
  'https://www.charentelibre.fr/recherche/?query=logement&page=1',
  'https://www.charentelibre.fr/recherche/?query=logement&page=2',
  'https://www.charentelibre.fr/recherche/?query=logement&page=3',
  'https://www.charentelibre.fr/recherche/?query=logement&page=4',
  'https://www.charentelibre.fr/recherche/?query=sociaux&page=0',
  'https://www.charentelibre.fr/recherche/?query=sociaux&page=1',
  'https://www.charentelibre.fr/recherche/?query=sociaux&page=2',
  'https://www.charentelibre.fr/recherche/?query=sociaux&page=3',
  'https://www.charentelibre.fr/recherche/?query=sociaux&page=4',
]

const crawler = new PuppeteerCrawler({
  maxConcurrency: 14,
  maxRequestsPerMinute: 25,
  launchContext: {
    launchOptions: {
      headless: true,
    },
  },

  async requestHandler({ request, page, enqueueLinks, log }) {
    log.info(`Processing ${request.url}...`)

    // Evaluated ** within ** the browser context
    let articles = await page.$$eval('.article-wrapper', ($posts) => {
      let scraped_data = []

      $posts.forEach(($post) => {
        scraped_data.push({
          title: $post.querySelector('.article-title').innerText.trim(),
          snippet: $post.querySelector('.article-description').innerText.trim(),
          href: $post.querySelector('a').href.trim(),
        })
      })

      return scraped_data
    })

    articles.forEach((element) => {
      element.published_on = null
      element.query = request.url
      element.publisher = 'www.charentelibre.f'
      element.location = null
    })

    articles = articles.filter((article) => is_relevant(article.title))

    for (const article of articles) {
      await save_article(article)
    }
  },
})

console.log('//////////// LA CHARENTE LIBRE ////////////')

await crawler.run(urls)

console.log('Crawler finished 🎉')
