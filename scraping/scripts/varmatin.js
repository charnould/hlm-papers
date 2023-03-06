import { parse, formatISO } from 'date-fns'
import { save_article } from '../models.js'
import { PuppeteerCrawler } from 'crawlee'
import { is_relevant } from '../helpers.js'

const urls = []
const generate_link = () => {
  let i = 0
  while (i < 10) {
    urls.push(`https://www.varmatin.com/async/search-article-list/hlm/${i}`)
    urls.push(`https://www.varmatin.com/async/search-article-list/bailleur/${i}`)
    urls.push(`https://www.varmatin.com/async/search-article-list/bailleurs/${i}`)
    urls.push(`https://www.varmatin.com/async/search-article-list/logement/${i}`)
    urls.push(`https://www.varmatin.com/async/search-article-list/social/${i}`)
    urls.push(`https://www.varmatin.com/async/search-article-list/sociaux/${i}`)

    i++
  }
}

generate_link()

const crawler = new PuppeteerCrawler({
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
          title: $post.querySelector('.title').innerText.trim(),
          snippet: $post.querySelector('.description').innerText.trim(),
          href: $post.querySelector('a').href.trim(),
          location: $post.querySelector('.blue').innerText.trim(),
        })
      })

      return scraped_data
    })

    articles.forEach((element) => {
      element.published_on = null
      element.query = request.url
      element.publisher = 'www.varmatin.com'
    })

    articles = articles.filter((article) => is_relevant(article.title))

    for (const article of articles) {
      await save_article(article)
    }
  },
})

console.log('//////////// VAR MATIN ////////////')

await crawler.run(urls)

console.log('Crawler finished 🎉')
