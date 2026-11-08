# BDF Lab 3 – Debugging Exercises & Troubleshooting Guide

**Student Name:** Kommula Nagaraju  
**Registration Number:** 252U1R9069  
**Course:** Backend Development Fundamentals  
**Academic Year:** Year II, Term II  
**University:** Aurora Deemed University  
**Faculty:** Joel Prashanth D  
**Lab Title:** REST API, Query Parameters, Validation and Debugging  

---

## Overview

In backend development with Node.js, Express, and SQLite, developers routinely encounter runtime exceptions, operational conflicts, and asynchronous execution pitfalls. This document provides an in-depth, student-friendly explanation of the four mandatory debugging scenarios required for Lab 3.

Each exercise breaks down:
1. **The Core Problem**
2. **Incorrect Code / Command**
3. **Exact Terminal Error Message**
4. **Corrected Code / Command**
5. **Detailed Technical Explanation & Viva Explanation Points**

---

## Exercise 1: Port Conflict (`EADDRINUSE`)

### 1. The Problem
When starting an Express server on a specific network port (e.g., port `3000`), the operating system binds that port to the Node.js process. If another application, a background daemon, or a previously un-terminated Node process is already listening on port `3000`, the operating system blocks the new process from binding to the same port.

### 2. Incorrect Code / Scenario
Attempting to launch two instances of the server simultaneously:
```bash
# Terminal 1: Starts first instance
node server.js
# Output: Server Running at http://localhost:3000/

# Terminal 2: Starts second instance while Terminal 1 is still active
node server.js
```

### 3. Error Message
```text
node:events:496
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1904:16)
    at listenInCluster (node:net:1961:12)
    at Server.listen (node:net:2066:7)
    at Function.listen (C:\Users\kommu\OneDrive\Desktop\lab\lab-03\node_modules\express\lib\application.js:635:24)
    at initializeDBAndServer (C:\Users\kommu\OneDrive\Desktop\lab\lab-03\server.js:25:9)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1939:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3000
}
```

### 4. Corrected Code & Resolution Steps

#### Option A: Terminate the Conflicting Process
In Windows PowerShell, find and kill the process holding port `3000`:
```powershell
# 1. Identify the Process ID (PID) occupying port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress, LocalPort, OwningProcess

# 2. Stop the process by PID (e.g., PID 12345)
Stop-Process -Id <PID> -Force
```

In Command Prompt:
```cmd
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

#### Option B: Dynamic Port Assignment via Environment Variable
Update `server.js` to allow a configurable fallback port:
```javascript
// Corrected Port Definition:
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running at http://localhost:${PORT}/`);
});
```

### 5. Examination Explanation
> *"A TCP port can only be bound by a single listening socket at any time. When `app.listen(3000)` executes while port 3000 is occupied, Node.js emits an unhandled `error` event with error code `EADDRINUSE` (Error: Address Already in Use). The fix is to terminate the orphaned process using its PID or configure environment-based dynamic port selection."*

---

## Exercise 2: Wrong Import Path (`MODULE_NOT_FOUND`)

### 1. The Problem
CommonJS uses `require()` to import internal modules and external npm packages. When referencing a local project file, Node.js requires a relative path prefix (`./` or `../`). If the relative prefix is omitted or misspelled, Node.js treats the string as a package inside `node_modules`. If no such package exists, Node throws `MODULE_NOT_FOUND`.

### 2. Incorrect Code
```javascript
// INCORRECT: Missing relative path prefix './' or typo in filename
const { initializeDB } = require('database.js'); 
// OR
const { initializeDB } = require('./db/database');
```

### 3. Error Message
```text
node:internal/modules/cjs/loader:1607
  throw err;
  ^

Error: Cannot find module 'database.js'
Require stack:
- C:\Users\kommu\OneDrive\Desktop\lab\lab-03\server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1603:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1145:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1169:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1196:12)
    at Module._load (node:internal/modules/cjs/loader:1370:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.require (node:internal/modules/cjs/loader:1713:12)
    at require (node:internal/modules/helpers:318:16)
    at Object.<anonymous> (C:\Users\kommu\OneDrive\Desktop\lab\lab-03\server.js:4:26) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ 'C:\\Users\\kommu\\OneDrive\\Desktop\\lab\\lab-03\\server.js' ]
}
```

### 4. Corrected Code
```javascript
// CORRECT: Proper relative path referencing the current directory
const { initializeDB } = require('./database');
// OR
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');
```

### 5. Examination Explanation
> *"In CommonJS module resolution, strings without `./` or `../` prefixes are resolved by traversing the `node_modules` hierarchy up to the filesystem root. For local project modules, we must always provide explicit relative paths such as `./database`. If omitted, Node fails to locate the file and raises a `MODULE_NOT_FOUND` runtime exception."*

---

## Exercise 3: SQLite Table-Name Typo (`SQLITE_ERROR: no such table`)

### 1. The Problem
SQL queries sent through `db.all()`, `db.get()`, or `db.run()` are compiled by the SQLite engine at runtime. If the SQL query specifies a table name with a typo (e.g., `books` plural instead of `book` singular), SQLite aborts query preparation and returns a `no such table` error.

### 2. Incorrect Code
```javascript
// INCORRECT: Table name is 'book', but query requests 'books'
app.get('/books', async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT *
      FROM books; -- Typo: 'books' does not exist in schema!
    `;
    const books = await db.all(getBooksQuery);
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
```

### 3. Error Message
In terminal log or JSON response:
```json
{
  "error": "SQLITE_ERROR: no such table: books"
}
```
Or in server console:
```text
Error: SQLITE_ERROR: no such table: books
    at Database.prepare (C:\Users\kommu\OneDrive\Desktop\lab\lab-03\node_modules\sqlite\index.js:14:24)
    at DatabaseWrapper.all (C:\Users\kommu\OneDrive\Desktop\lab\lab-03\node_modules\sqlite\index.js:15:24)
    at C:\Users\kommu\OneDrive\Desktop\lab\lab-03\server.js:58:28 {
  errno: 1,
  code: 'SQLITE_ERROR'
}
```

### 4. Corrected Code
```javascript
// CORRECT: Query targets the exact schema table name 'book'
app.get('/books', async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT *
      FROM book; -- Correct singular table name
    `;
    const books = await db.all(getBooksQuery);
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
```

### 5. Examination Explanation
> *"SQLite enforces strict schema validation during query compilation. Our database schema defines `CREATE TABLE IF NOT EXISTS book (...)` in the singular. If an endpoint requests `FROM books`, the SQLite query planner aborts execution with `SQLITE_ERROR: no such table`. The solution is to align the SQL statement with the exact table identifier declared in the database schema."*

---

## Exercise 4: Missing `await` in Asynchronous Operations

### 1. The Problem
All database calls in `sqlite` (`db.all()`, `db.get()`, `db.run()`) return JavaScript `Promise` objects. When a developer forgets the `await` keyword before a promise-returning method, JavaScript does not wait for the I/O operation to complete. Instead, it assigns the pending `Promise` instance directly to the variable, causing Express to serialize an unresolved empty object `{}` rather than the actual query result.

### 2. Incorrect Code
```javascript
// INCORRECT: Missing 'await' keyword before db.get()
app.get('/books/:bookId', async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;

    // Bug: book is assigned a Promise { <pending> }, NOT the resolved row object!
    const book = db.get(getBookQuery, [bookId]); 

    // Because a Promise object is truthy, book !== undefined is ALWAYS true!
    if (book === undefined) {
      response.status(404).json({ error: 'Book Not Found' });
    } else {
      // response.json() serializes the pending Promise to an empty object: {}
      response.status(200).json(book); 
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
```

### 3. Faulty Output / Symptoms
1. **HTTP Status:** `200 OK` (incorrect even if the ID is 999).
2. **Response Body:**
   ```json
   {}
   ```
3. **Console Log:**
   ```text
   book: Promise { <pending> }
   ```
4. The application never catches non-existent records, and clients receive empty responses instead of data.

### 4. Corrected Code
```javascript
// CORRECT: 'await' pauses function execution until the promise resolves
app.get('/books/:bookId', async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;

    // Correctly await database query resolution
    const book = await db.get(getBookQuery, [bookId]);

    if (book === undefined) {
      response.status(404).json({ error: 'Book Not Found' });
    } else {
      response.status(200).json(book);
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
```

### 5. Examination Explanation
> *"Database queries are non-blocking asynchronous operations that return a Promise. Without `await`, the variable holds a reference to an unresolved `Promise { <pending> }` object. In JavaScript, all objects are truthy, so existence checks (`if (book === undefined)`) fail to detect missing records, and `res.json(book)` serializes the Promise to `{}`. Placing `await` before `db.get()` pauses handler execution until the SQLite engine returns the resolved row or `undefined`."*

---

## Summary Matrix for Viva Examination

| Issue Code | Trigger | Manifestation | Resolution |
|---|---|---|---|
| **EADDRINUSE** | Multiple processes bound to port 3000 | Server crash on startup (`listen EADDRINUSE`) | Terminate existing PID via `Stop-Process` or `taskkill` |
| **MODULE_NOT_FOUND** | Missing `./` or misspelling in `require()` | Script crash before initialization | Use explicit relative path `./database` |
| **SQLITE_ERROR** | Typo in table name (`books` vs `book`) | 500 error: `no such table: books` | Correct table identifier in SQL statement |
| **Missing `await`** | Omitting `await` on `db.get()` / `db.all()` | Returns HTTP 200 with `{}` empty body | Add `await` before asynchronous promise call |
