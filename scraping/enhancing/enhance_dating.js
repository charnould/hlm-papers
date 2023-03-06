import Database from 'better-sqlite3'
export const db = new Database('data.db')
import { isValid, format, parseISO } from 'date-fns'

export const get_article = async () => {
  try {
    const articles = db
      .prepare(
        `SELECT
         rowid,
         published_on,
         published_on_yyyy,
         published_on_MMMM,
         published_on_yyyy_MM,
         published_on_eeee
      FROM articles`
      )
      .all()

    for (const article of articles) {
      const is_date_valid = () => {
        const ISODate = parseISO(article.published_on)
        const isValidDate = isValid(ISODate)
        if (isValidDate == true) return true
        else return false
      }

      if (is_date_valid() === true) {
        article.published_on_yyyy = format(parseISO(article.published_on), 'yyyy', new Date())
        article.published_on_MMMM = format(parseISO(article.published_on), 'MM/MMMM', new Date())
        article.published_on_yyyy_MM = format(parseISO(article.published_on), 'yyyy/MM', new Date())
        article.published_on_yyyy_qqq = format(parseISO(article.published_on), 'yyyy/qqq', new Date())
        article.published_on_eeee = format(parseISO(article.published_on), 'ii/iiii', new Date())
      }

      db.exec(`
        UPDATE articles
        SET
          published_on_yyyy='${article.published_on_yyyy}',
          published_on_MMMM='${article.published_on_MMMM}',
          published_on_yyyy_MM='${article.published_on_yyyy_MM}',
          published_on_eeee='${article.published_on_eeee}',
          published_on_yyyy_qqq='${article.published_on_yyyy_qqq}'
        WHERE rowid='${article.rowid}'
        `)

      console.log(article)
    }
  } catch (err) {
    console.log(err)
  }
  return
}

get_article()
