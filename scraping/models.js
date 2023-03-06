import Database from 'better-sqlite3'
export const db = new Database('data.db')

const create_articles_table = `
  CREATE TABLE IF NOT EXISTS articles (
    "title"         TEXT  UNIQUE,
	"snippet"       TEXT,
    "url"           TEXT  UNIQUE,
    "query"	        TEXT,
    "publisher"     TEXT,
    "published_on"  TEXT,
    "location"      TEXT
    )`

db.exec(create_articles_table)

export const save_article = (article) => {
  try {
    const stmt = db.prepare('INSERT INTO articles (title, snippet, url, query, publisher, published_on, location) VALUES (?, ?, ?, ?, ?, ?, ?)')
    stmt.run(article.title, article.snippet, article.url, article.query, article.publisher, article.published_on, article.location)
    console.log(article)
    console.log('🟢 New relevant article saved')
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(article)
      console.log('🟠 Article not saved (duplicate)')
    } else console.log(err)
  }
  return
}
