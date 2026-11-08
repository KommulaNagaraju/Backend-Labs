const path = require('path')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const defaultDbPath = path.join(__dirname, 'database.db')
let dbInstance = null

// Seed data array with the 10 required books
const initialBooks = [
  ['The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 45, 352],
  ['Clean Code', 'Robert C. Martin', 40, 464],
  ['JavaScript: The Good Parts', 'Douglas Crockford', 30, 176],
  ['Design Patterns', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 55, 395],
  ['Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 85, 1312],
  ["You Don't Know JS Yet", 'Kyle Simpson', 25, 142],
  ['Designing Data-Intensive Applications', 'Martin Kleppmann', 50, 616],
  ['Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 48, 448],
  ['Node.js Design Patterns', 'Mario Casciaro & Luciano Mammino', 42, 520],
  ['Eloquent JavaScript', 'Marijn Haverbeke', 35, 472],
]

/**
 * Initializes the SQLite database and seeds the 10 initial records if empty.
 * Reuses existing database and avoids duplicate seed insertions.
 */
const initializeDB = async (dbPath = defaultDbPath) => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Create table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `)

    // Check if table is empty
    const countRow = await db.get('SELECT COUNT(*) as count FROM book;')
    if (countRow.count === 0) {
      console.log('Seeding initial 10 book records...')
      for (const book of initialBooks) {
        await db.run(
          `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`,
          book
        )
      }
      console.log('Database seeded successfully.')
    }

    dbInstance = db
    return db
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`)
    throw error
  }
}

const getDB = () => dbInstance

// Allow standalone execution: node database.js
if (require.main === module) {
  ;(async () => {
    try {
      const db = await initializeDB()
      const books = await db.all('SELECT * FROM book;')
      console.log(`Database connected. Total books: ${books.length}`)
      console.table(books)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })()
}

module.exports = {
  initializeDB,
  getDB,
  initialBooks,
}
