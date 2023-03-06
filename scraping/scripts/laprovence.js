import { parse, formatISO } from 'date-fns'
import { save_article } from '../models.js'
import { PuppeteerCrawler } from 'crawlee'
import { is_relevant } from '../helpers.js'

const crawler = new PuppeteerCrawler({
  launchContext: {
    launchOptions: {
      headless: true,
    },
  },

  async requestHandler({ request, page, enqueueLinks, log }) {
    log.info(`Processing ${request.url}...`)

    // Evaluated ** within ** the browser context
    let articles = await page.$$eval('.article-list__text-wrapper', ($posts) => {
      let scraped_data = []

      $posts.forEach(($post) => {
        scraped_data.push({
          title: $post.querySelector('h2').innerText.trim(),
          href: $post.querySelector('a').href.trim(),
          snippet: $post.querySelector('.article-list__text-title ').innerText.trim(),
          published_on: $post.querySelector('.article-list__time').innerText.trim().split(' ')[0],
        })
      })

      return scraped_data
    })

    articles.forEach((element) => {
      element.published_on = formatISO(parse(element.published_on, 'dd/MM/yyyy', new Date()))
      element.query = request.url
      element.publisher = 'www.laprovence.com'
      element.location = null
    })

    articles = articles.filter((article) => is_relevant(article.title))

    for (const article of articles) {
      await save_article(article)
    }
  },
})

console.log('//////////// LA PROVENCE ////////////')

await crawler.run([
  'https://www.laprovence.com/recherche/hlm/page/1',
  'https://www.laprovence.com/recherche/hlm/page/2',
  'https://www.laprovence.com/recherche/bailleur/page/1',
  'https://www.laprovence.com/recherche/bailleur/page/2',
  'https://www.laprovence.com/recherche/logements/page/1',
  'https://www.laprovence.com/recherche/logements/page/2',
])

console.log('Crawler finished 🎉')
