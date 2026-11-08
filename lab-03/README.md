# Lab 3: REST API, Query Parameters, Validation and Debugging

## Student Details

- **Student Name:** Kommula Nagaraju
- **Registration Number:** 252U1R9069
- **Course:** Backend Development Fundamentals
- **Academic Term:** Year II – Term II
- **University:** Aurora Deemed University
- **Faculty:** Joel Prashanth D

---

## Live Deployment

- **Deployment URL:** `[To be updated after cloud deployment - e.g., https://backend-labs-lab-03.onrender.com]`
- **Deployment Platform:** Render (Web Service) / Vercel
- **Deployment Status:** Pending Manual Cloud Deployment (Local Execution Verified)

---

## Objective

To build an advanced, robust REST API server in Node.js and Express.js connected to an SQLite database (`database.db`), extending the CRUD operations built in Lab 2. The project focuses on:
1. Handling query parameters for search, sorting, pagination, and price-range filtering.
2. Implementing SQL `LIKE`, `ORDER BY`, `LIMIT`, and `OFFSET` using parameterized queries.
3. Validating incoming query parameters and request bodies to prevent SQL injection and invalid state.
4. Returning standardized HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
5. Analyzing and troubleshooting common backend errors (`EADDRINUSE`, `MODULE_NOT_FOUND`, `SQLITE_ERROR`, missing `await`).

---

## Technologies Used

- **Runtime Environment:** Node.js (CommonJS syntax)
- **Web Framework:** Express.js (`express`)
- **Database Engine:** SQLite3 (`sqlite3` driver & `sqlite` promise wrapper)
- **API Testing:** Postman & Native HTTP Test Runner
- **Code Editor:** Visual Studio Code / Antigravity IDE

---

## Project Structure

```text
lab-03/
├── server.js                      # Express application, routing, validation, and database initialization
├── database.js                    # Database setup, schema definition, and automatic seeder
├── database.db                    # Persistent SQLite database containing the 10 book records
├── package.json                   # Project metadata, dependencies, and execution scripts
├── test_all_apis.js               # Automated test suite executing all 20 API test cases
├── .gitignore                     # Ignores node_modules/, *.log, OS system files
├── README.md                      # Comprehensive project documentation and test reports
├── screenshots/                   # Postman & verification screenshots
│   ├── 01-get-all-books.png
│   ├── 02-search-books.png
│   ├── 03-sort-ascending.png
│   ├── 04-sort-descending.png
│   ├── 05-pagination.png
│   ├── 06-pagination-next-page.png
│   ├── 07-min-price-filter.png
│   ├── 08-max-price-filter.png
│   ├── 09-price-range.png
│   ├── 10-combined-query.png
│   ├── 11-get-book-by-id.png
│   ├── 12-book-not-found.png
│   ├── 13-add-book.png
│   ├── 14-missing-title.png
│   ├── 15-missing-author.png
│   ├── 16-invalid-price.png
│   ├── 17-update-book.png
│   ├── 18-update-invalid-id.png
│   ├── 19-delete-book.png
│   ├── 20-delete-invalid-id.png
│   ├── 21-sqlite-database.png
│   ├── 22-port-conflict.png
│   ├── 23-import-error.png
│   ├── 24-table-error.png
│   └── 25-missing-await.png
└── debugging/
    └── debugging-exercises.md     # Detailed analysis of 4 common backend debugging scenarios
```

---

## Database Schema & Initial Records

### Table Schema: `book`

```sql
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);
```

### Initial Seed Data (10 Books)

| ID | Title | Author | Price ($) | Pages |
|:--:|---|---|:---:|:---:|
| **1** | The Pragmatic Programmer | Andrew Hunt & David Thomas | 45 | 352 |
| **2** | Clean Code | Robert C. Martin | 40 | 464 |
| **3** | JavaScript: The Good Parts | Douglas Crockford | 30 | 176 |
| **4** | Design Patterns | Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides | 55 | 395 |
| **5** | Introduction to Algorithms | Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein | 85 | 1312 |
| **6** | You Don't Know JS Yet | Kyle Simpson | 25 | 142 |
| **7** | Designing Data-Intensive Applications | Martin Kleppmann | 50 | 616 |
| **8** | Refactoring: Improving the Design of Existing Code | Martin Fowler | 48 | 448 |
| **9** | Node.js Design Patterns | Mario Casciaro & Luciano Mammino | 42 | 520 |
| **10** | Eloquent JavaScript | Marijn Haverbeke | 35 | 472 |

---

## Installation & Setup Instructions

### 1. Prerequisites
- Node.js installed (v18.0.0 or higher).
- Git installed.

### 2. Installation
Open a terminal in the `lab-03/` directory and install project dependencies:
```bash
npm install
```

### 3. Initialize / Seed the Database (Optional)
The database is auto-initialized on first server run, but you can also run the standalone database manager:
```bash
npm run init-db
```

### 4. Run the Express Server
```bash
# Standard execution
npm start

# Development mode with Nodemon (auto-restarts on file edit)
npm run dev
```
The server will start at: `http://localhost:3000/`

### 5. Run Automated Verification Tests
```bash
npm test
```

---

## API Endpoints Table

| # | HTTP Method | Endpoint | Description | Query / Body Params | Status Code |
|:---:|:---:|---|---|---|:---:|
| **1** | `GET` | `/books` | Retrieve books with optional search, sorting, pagination, & filters | `search_q`, `order_by`, `order`, `limit`, `offset`, `min_price`, `max_price` | `200 OK` / `400 Bad Request` |
| **2** | `GET` | `/books/:bookId` | Retrieve a specific book by ID | URL path param: `bookId` | `200 OK` / `404 Not Found` |
| **3** | `POST` | `/books` | Insert a new book record | JSON body: `{ title, author, price, pages }` | `201 Created` / `400 Bad Request` |
| **4** | `PUT` | `/books/:bookId` | Update an existing book's details | JSON body: `{ title, author, price, pages }` | `200 OK` / `400 Bad Request` / `404 Not Found` |
| **5** | `DELETE` | `/books/:bookId` | Delete a book record by ID | URL path param: `bookId` | `200 OK` / `404 Not Found` |

---

## Query Parameters Explanation (`GET /books`)

The `/books` endpoint accepts seven query parameters to dynamically shape query results:

1. **`search_q` (String, default: `""`):**
   - Filters records by matching a substring in the `title` column using SQL `LIKE ?` (`%search_q%`).
   - Example: `/books?search_q=JavaScript` matches *"JavaScript: The Good Parts"* and *"Eloquent JavaScript"*.

2. **`order_by` (String, default: `"id"`):**
   - Specifies the column by which the dataset should be sorted.
   - Protected with an allowlist `['id', 'title', 'author', 'price', 'pages']` to prevent SQL injection.
   - Example: `/books?order_by=price`

3. **`order` (String, default: `"ASC"`):**
   - Sort direction: either `"ASC"` (Ascending) or `"DESC"` (Descending).
   - Example: `/books?order_by=price&order=DESC`

4. **`limit` (Integer, default: `10`):**
   - Maximum number of book records to return. Must be non-negative.
   - Example: `/books?limit=5` returns the first 5 records.

5. **`offset` (Integer, default: `0`):**
   - Number of records to skip for pagination. Must be non-negative.
   - Example: `/books?limit=5&offset=5` returns records 6 through 10 (Page 2).

6. **`min_price` (Integer/Float, default: `0`):**
   - Filters books with `price >= min_price`. Must be a non-negative number.
   - Example: `/books?min_price=45`

7. **`max_price` (Integer/Float, default: `1000000`):**
   - Filters books with `price <= max_price`.
   - The server validates that `min_price <= max_price`, returning `400 Bad Request` if violated.
   - Example: `/books?min_price=40&max_price=50`

---

## Postman Testing Guide (All 20 Test Cases)

Base URL: `http://localhost:3000`

### GET Requests

#### Test Case 1: Get All Books
- **Method:** `GET`
- **URL:** `http://localhost:3000/books`
- **Status:** `200 OK`
- **Expected Result:** Array containing all 10 initial books.

#### Test Case 2: Search Books
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?search_q=JavaScript`
- **Status:** `200 OK`
- **Expected Result:** 2 books matching "JavaScript" (IDs: 3, 10).

#### Test Case 3: Sort Ascending by Price
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?order_by=price&order=ASC`
- **Status:** `200 OK`
- **Expected Result:** Books sorted cheapest to most expensive (first: *"You Don't Know JS Yet"* at \$25).

#### Test Case 4: Sort Descending by Price
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?order_by=price&order=DESC`
- **Status:** `200 OK`
- **Expected Result:** Books sorted most expensive to cheapest (first: *"Introduction to Algorithms"* at \$85).

#### Test Case 5: Pagination - First Page
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?limit=5&offset=0`
- **Status:** `200 OK`
- **Expected Result:** First 5 books (IDs: 1 to 5).

#### Test Case 6: Pagination - Second Page
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?limit=5&offset=5`
- **Status:** `200 OK`
- **Expected Result:** Next 5 books (IDs: 6 to 10).

#### Test Case 7: Minimum Price Filter
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?min_price=45`
- **Status:** `200 OK`
- **Expected Result:** All books with `price >= 45` (IDs: 1, 4, 5, 7, 8).

#### Test Case 8: Maximum Price Filter
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?max_price=40`
- **Status:** `200 OK`
- **Expected Result:** All books with `price <= 40` (IDs: 2, 3, 6, 10).

#### Test Case 9: Price Range Filter
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?min_price=40&max_price=50`
- **Status:** `200 OK`
- **Expected Result:** 5 books priced between \$40 and \$50 (IDs: 1, 2, 7, 8, 9).

#### Test Case 10: Combined Query Parameters
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?search_q=JavaScript&order_by=price&order=ASC&limit=5&offset=0&min_price=25&max_price=50`
- **Status:** `200 OK`
- **Expected Result:** 2 books matching JavaScript between \$25-\$50 sorted ascending by price.

#### Test Case 11: Get Individual Book by ID
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/1`
- **Status:** `200 OK`
- **Expected Result:** `{ "id": 1, "title": "The Pragmatic Programmer", "author": "Andrew Hunt & David Thomas", "price": 45, "pages": 352 }`

#### Test Case 12: Book Not Found
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/999`
- **Status:** `404 Not Found`
- **Expected Result:** `{ "error": "Book Not Found" }`

---

### POST Requests

#### Test Case 13: Add a New Book
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "title": "Python Programming",
    "author": "John",
    "price": 60,
    "pages": 350
  }
  ```
- **Status:** `201 Created`
- **Expected Result:**
  ```json
  {
    "message": "Book Added Successfully",
    "bookId": 11
  }
  ```

#### Test Case 14: Validation - Missing Title
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Body:**
  ```json
  {
    "author": "John",
    "price": 60,
    "pages": 350
  }
  ```
- **Status:** `400 Bad Request`
- **Expected Result:** `{ "error": "Invalid or missing title" }`

#### Test Case 15: Validation - Missing Author
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Body:**
  ```json
  {
    "title": "Python Programming",
    "price": 60,
    "pages": 350
  }
  ```
- **Status:** `400 Bad Request`
- **Expected Result:** `{ "error": "Invalid or missing author" }`

#### Test Case 16: Validation - Invalid Price
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Body:**
  ```json
  {
    "title": "Python Programming",
    "author": "John",
    "price": "invalid_price",
    "pages": 350
  }
  ```
- **Status:** `400 Bad Request`
- **Expected Result:** `{ "error": "Price must be a valid non-negative number" }`

---

### PUT Requests

#### Test Case 17: Update Existing Book
- **Method:** `PUT`
- **URL:** `http://localhost:3000/books/1`
- **Body:**
  ```json
  {
    "title": "The Pragmatic Programmer: 20th Anniversary Edition",
    "author": "Andrew Hunt & David Thomas",
    "price": 50,
    "pages": 360
  }
  ```
- **Status:** `200 OK`
- **Expected Result:** `{ "message": "Book Details Updated" }`

#### Test Case 18: Update Non-Existent Book ID
- **Method:** `PUT`
- **URL:** `http://localhost:3000/books/999`
- **Body:** Same valid JSON body as Test 17.
- **Status:** `404 Not Found`
- **Expected Result:** `{ "error": "Book Not Found" }`

---

### DELETE Requests

#### Test Case 19: Delete Existing Book
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/books/11`
- **Status:** `200 OK`
- **Expected Result:** `{ "message": "Book Removed" }`

#### Test Case 20: Delete Non-Existent Book ID
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/books/999`
- **Status:** `404 Not Found`
- **Expected Result:** `{ "error": "Book Not Found" }`

---

## HTTP Status Codes Reference

| Code | Label | Meaning in this Project |
|:---:|---|---|
| **200** | **OK** | Request successfully processed (`GET` books retrieved, `PUT` updated, `DELETE` removed). |
| **201** | **Created** | New book record successfully inserted into database (`POST`). |
| **400** | **Bad Request** | Missing fields, non-numeric price/pages, empty strings, or negative pagination bounds. |
| **404** | **Not Found** | Target book ID does not exist in the database table. |
| **500** | **Internal Server Error** | Unexpected SQLite driver failure or server runtime exception. |

---

## Screenshots

The following 25 screenshots document the complete execution, Postman testing, and debugging exercises of Lab 3:

### API Execution Screenshots

#### 01. Get All Books
![Get All Books](screenshots/01-get-all-books.png)

#### 02. Search Books (`search_q=JavaScript`)
![Search Books](screenshots/02-search-books.png)

#### 03. Sort Ascending (`order_by=price&order=ASC`)
![Sort Ascending](screenshots/03-sort-ascending.png)

#### 04. Sort Descending (`order_by=price&order=DESC`)
![Sort Descending](screenshots/04-sort-descending.png)

#### 05. Pagination - First Page (`limit=5&offset=0`)
![Pagination First Page](screenshots/05-pagination.png)

#### 06. Pagination - Next Page (`limit=5&offset=5`)
![Pagination Next Page](screenshots/06-pagination-next-page.png)

#### 07. Minimum Price Filter (`min_price=45`)
![Minimum Price Filter](screenshots/07-min-price-filter.png)

#### 08. Maximum Price Filter (`max_price=40`)
![Maximum Price Filter](screenshots/08-max-price-filter.png)

#### 09. Price Range Filter (`min_price=40&max_price=50`)
![Price Range Filter](screenshots/09-price-range.png)

#### 10. Combined Query Parameters
![Combined Query](screenshots/10-combined-query.png)

#### 11. Get Book by ID (`/books/1`)
![Get Book by ID](screenshots/11-get-book-by-id.png)

#### 12. Book Not Found (`/books/999`)
![Book Not Found](screenshots/12-book-not-found.png)

#### 13. Add Book (`POST /books`)
![Add Book](screenshots/13-add-book.png)

#### 14. Validation - Missing Title
![Missing Title](screenshots/14-missing-title.png)

#### 15. Validation - Missing Author
![Missing Author](screenshots/15-missing-author.png)

#### 16. Validation - Invalid Price
![Invalid Price](screenshots/16-invalid-price.png)

#### 17. Update Book (`PUT /books/1`)
![Update Book](screenshots/17-update-book.png)

#### 18. Update Invalid ID (`PUT /books/999`)
![Update Invalid ID](screenshots/18-update-invalid-id.png)

#### 19. Delete Book (`DELETE /books/11`)
![Delete Book](screenshots/19-delete-book.png)

#### 20. Delete Invalid ID (`DELETE /books/999`)
![Delete Invalid ID](screenshots/20-delete-invalid-id.png)

---

### Database & Debugging Screenshots

#### 21. SQLite Database CLI Verification
![SQLite Database Verification](screenshots/21-sqlite-database.png)

#### 22. Debugging 1 – Port Conflict (`EADDRINUSE`)
![Port Conflict](screenshots/22-port-conflict.png)

#### 23. Debugging 2 – Wrong Import Path (`MODULE_NOT_FOUND`)
![Import Error](screenshots/23-import-error.png)

#### 24. Debugging 3 – Table Name Typo (`SQLITE_ERROR`)
![Table Error](screenshots/24-table-error.png)

#### 25. Debugging 4 – Missing `await` Asynchronous Bug
![Missing Await](screenshots/25-missing-await.png)

---

## Debugging Exercises Summary

A dedicated troubleshooting guide is available at [`debugging/debugging-exercises.md`](debugging/debugging-exercises.md). It analyzes:

1. **`EADDRINUSE`:** Occurs when two node instances bind to port 3000 simultaneously. Resolved via `Stop-Process -Id <PID> -Force` or setting dynamic ports (`process.env.PORT || 3000`).
2. **Wrong Import Path:** Occurs when omitting `./` in CommonJS `require('database.js')`, causing Node to search `node_modules` instead of the local directory. Fixed using `require('./database')`.
3. **SQLite Table Typo:** Querying `FROM books` instead of `FROM book` raises `SQLITE_ERROR: no such table: books`. Fixed by matching schema table name.
4. **Missing `await`:** Omitting `await` returns an unresolved `Promise { <pending> }`. Express serializes it to an empty `{}` object with an incorrect 200 status code. Fixed by adding `await db.get(...)`.

---

## Problems Faced and Solutions

1. **SQL Injection in `ORDER BY` Clause:**
   - *Problem:* SQL column names cannot be passed as parameterized query placeholders (`?`) in SQLite. Direct template interpolation `ORDER BY ${order_by}` enables SQL injection attacks.
   - *Solution:* Implemented a strict allowlist `['id', 'title', 'author', 'price', 'pages']`. If the user input is not in the allowlist, it defaults safely to `'id'`.

2. **Negative and Inverted Price Filter Bounds:**
   - *Problem:* Passing `min_price=100&max_price=20` returns an empty array with 200 OK without notifying the client of invalid logic.
   - *Solution:* Added explicit validation `if (parsedMinPrice > parsedMaxPrice)` that returns `400 Bad Request` with an informative error message.

3. **Silent Failures on Non-Existent `UPDATE` and `DELETE`:**
   - *Problem:* In SQLite, `UPDATE` and `DELETE` on a missing ID do not throw an error; they simply modify 0 rows.
   - *Solution:* Inspected `result.changes`. If `result.changes === 0`, the endpoint returns a `404 Not Found` response with `{ "error": "Book Not Found" }`.

4. **Preserving Database Integrity on Server Restarts:**
   - *Problem:* Inserting seed records on every startup duplicates records or triggers primary key constraint errors.
   - *Solution:* Implemented `SELECT COUNT(*) FROM book` check in `database.js` so seeding triggers only when the table is completely empty.

---

## Conclusion

Lab 3 demonstrates how to build a production-grade, secure REST API in Node.js and Express.js with SQLite. By implementing query parameters with parameterized SQL queries, strict allowlists, input validation, structured HTTP status codes, and thorough debugging practices, this project establishes a reliable foundation for enterprise backend engineering.

