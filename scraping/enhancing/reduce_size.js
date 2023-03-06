import fs from 'fs'

try {
  const json = fs.readFileSync('./docs/data.json', 'utf8')
  const parsed_json = JSON.parse(json)

  for (const article of parsed_json) {
    delete article.published_on
    delete article.location
    delete article.query
    delete article.snippet
    delete article.url
  }

  fs.writeFileSync('./docs/data.json', JSON.stringify(parsed_json))
} catch (err) {
  console.error(err)
}
