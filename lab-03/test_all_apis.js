const http = require('http')

// Helper function to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        let parsed = data
        try {
          parsed = JSON.parse(data)
        } catch (e) {
          // keep as string
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        })
      })
    })

    req.on('error', (err) => reject(err))

    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function runTests() {
  console.log('====================================================')
  console.log('BDF LAB 3 - ALL 20 API TEST CASES EXECUTION')
  console.log('====================================================\n')

  let passed = 0
  let failed = 0

  function assert(testNum, testName, condition, details = '') {
    if (condition) {
      console.log(`[PASS] Test ${testNum}: ${testName}`)
      passed++
    } else {
      console.error(`[FAIL] Test ${testNum}: ${testName} - ${details}`)
      failed++
    }
  }

  try {
    // 1. Get all books
    const t1 = await request('GET', '/books')
    assert(1, 'Get All Books', t1.status === 200 && Array.isArray(t1.data) && t1.data.length >= 10, `Status: ${t1.status}, Count: ${t1.data.length}`)

    // 2. Search books (JavaScript)
    const t2 = await request('GET', '/books?search_q=JavaScript')
    assert(2, 'Search Books (search_q=JavaScript)', t2.status === 200 && t2.data.length === 2 && t2.data.every(b => b.title.includes('JavaScript')), `Count: ${t2.data.length}`)

    // 3. Sort ascending (order_by=price&order=ASC)
    const t3 = await request('GET', '/books?order_by=price&order=ASC')
    const isAsc = t3.data.every((b, i, arr) => i === 0 || arr[i - 1].price <= b.price)
    assert(3, 'Sort Ascending by Price', t3.status === 200 && isAsc && t3.data[0].price === 25, `First price: ${t3.data[0]?.price}`)

    // 4. Sort descending (order_by=price&order=DESC)
    const t4 = await request('GET', '/books?order_by=price&order=DESC')
    const isDesc = t4.data.every((b, i, arr) => i === 0 || arr[i - 1].price >= b.price)
    assert(4, 'Sort Descending by Price', t4.status === 200 && isDesc && t4.data[0].price === 85, `First price: ${t4.data[0]?.price}`)

    // 5. Pagination (limit=5&offset=0)
    const t5 = await request('GET', '/books?limit=5&offset=0')
    assert(5, 'Pagination First Page (limit=5&offset=0)', t5.status === 200 && t5.data.length === 5 && t5.data[0].id === 1, `Count: ${t5.data.length}`)

    // 6. Pagination second page (limit=5&offset=5)
    const t6 = await request('GET', '/books?limit=5&offset=5')
    assert(6, 'Pagination Second Page (limit=5&offset=5)', t6.status === 200 && t6.data.length === 5 && t6.data[0].id === 6, `First ID: ${t6.data[0]?.id}`)

    // 7. Minimum price filter (min_price=45)
    const t7 = await request('GET', '/books?min_price=45')
    const minPriceOk = t7.data.every(b => b.price >= 45)
    assert(7, 'Minimum Price Filter (min_price=45)', t7.status === 200 && minPriceOk, `Count: ${t7.data.length}`)

    // 8. Maximum price filter (max_price=40)
    const t8 = await request('GET', '/books?max_price=40')
    const maxPriceOk = t8.data.every(b => b.price <= 40)
    assert(8, 'Maximum Price Filter (max_price=40)', t8.status === 200 && maxPriceOk, `Count: ${t8.data.length}`)

    // 9. Price range filter (min_price=40&max_price=50)
    const t9 = await request('GET', '/books?min_price=40&max_price=50')
    const rangeOk = t9.data.every(b => b.price >= 40 && b.price <= 50)
    assert(9, 'Price Range Filter (min_price=40&max_price=50)', t9.status === 200 && rangeOk && t9.data.length === 5, `Count: ${t9.data.length}`)

    // 10. Combined query parameters
    const t10 = await request('GET', '/books?search_q=JavaScript&order_by=price&order=ASC&limit=5&offset=0&min_price=25&max_price=50')
    assert(10, 'Combined Query Parameters', t10.status === 200 && t10.data.length === 2 && t10.data[0].price === 30, `Count: ${t10.data.length}`)

    // 11. Get individual book by ID (id=1)
    const t11 = await request('GET', '/books/1')
    assert(11, 'Get Individual Book (/books/1)', t11.status === 200 && t11.data.id === 1 && t11.data.title === 'The Pragmatic Programmer', `Title: ${t11.data.title}`)

    // 12. Book not found (/books/999)
    const t12 = await request('GET', '/books/999')
    assert(12, 'Book Not Found (/books/999)', t12.status === 404 && t12.data.error === 'Book Not Found', `Status: ${t12.status}, Error: ${t12.data.error}`)

    // 13. Add a book (POST /books)
    const newBook = {
      title: 'Python Programming',
      author: 'John',
      price: 60,
      pages: 350,
    }
    const t13 = await request('POST', '/books', newBook)
    const createdId = t13.data.bookId
    assert(13, 'Add a Book (POST /books)', t13.status === 201 && t13.data.message === 'Book Added Successfully' && createdId, `ID: ${createdId}`)

    // 14. Missing title
    const t14 = await request('POST', '/books', { author: 'John', price: 60, pages: 350 })
    assert(14, 'Missing Title Validation', t14.status === 400 && t14.data.error === 'Invalid or missing title', `Status: ${t14.status}`)

    // 15. Missing author
    const t15 = await request('POST', '/books', { title: 'Python Programming', price: 60, pages: 350 })
    assert(15, 'Missing Author Validation', t15.status === 400 && t15.data.error === 'Invalid or missing author', `Status: ${t15.status}`)

    // 16. Invalid price
    const t16 = await request('POST', '/books', { title: 'Python Programming', author: 'John', price: 'abc', pages: 350 })
    assert(16, 'Invalid Price Validation', t16.status === 400 && t16.data.error.includes('Price'), `Status: ${t16.status}`)

    // 17. Update book (PUT /books/1)
    const updateBody = {
      title: 'The Pragmatic Programmer (20th Anniversary)',
      author: 'Andrew Hunt & David Thomas',
      price: 50,
      pages: 352,
    }
    const t17 = await request('PUT', '/books/1', updateBody)
    assert(17, 'Update Book (PUT /books/1)', t17.status === 200 && t17.data.message === 'Book Details Updated', `Message: ${t17.data.message}`)

    // Restore book 1
    await request('PUT', '/books/1', {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt & David Thomas',
      price: 45,
      pages: 352,
    })

    // 18. Update invalid ID (PUT /books/999)
    const t18 = await request('PUT', '/books/999', updateBody)
    assert(18, 'Update Invalid ID (PUT /books/999)', t18.status === 404 && t18.data.error === 'Book Not Found', `Status: ${t18.status}`)

    // 19. Delete book (DELETE /books/:createdId)
    const t19 = await request('DELETE', `/books/${createdId}`)
    assert(19, 'Delete Book (DELETE /books/:id)', t19.status === 200 && t19.data.message === 'Book Removed', `Status: ${t19.status}`)

    // 20. Delete invalid ID (DELETE /books/999)
    const t20 = await request('DELETE', '/books/999')
    assert(20, 'Delete Invalid ID (DELETE /books/999)', t20.status === 404 && t20.data.error === 'Book Not Found', `Status: ${t20.status}`)

    console.log('\n====================================================')
    console.log(`TOTAL TESTS: 20 | PASSED: ${passed} | FAILED: ${failed}`)
    console.log('====================================================')

    if (failed === 0) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  } catch (error) {
    console.error('Test execution failed:', error)
    process.exit(1)
  }
}

// Start server in-process if not already running, then test
const app = require('./server')
setTimeout(runTests, 1500)
