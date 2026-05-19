import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [user, setUser] = useState(null)

  // CRUD & Detail States
  const [selectedBook, setSelectedBook] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCrudModal, setShowCrudModal] = useState(false)
  const [crudMode, setCrudMode] = useState('add') // 'add' or 'edit'
  
  // Form Input States
  const [bookId, setBookId] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [price, setPrice] = useState('')
  const [stockCount, setStockCount] = useState('')

  const fetchBooks = (query = '') => {
    setLoading(true)
    const url = query 
      ? `http://127.0.0.1:5000/api/books?search=${encodeURIComponent(query)}`
      : 'http://127.0.0.1:5000/api/books'
    fetch(url)
      .then((res) => res.json())
      .then((payload) => {
        setBooks(payload.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => { fetchBooks() }, [])

  const openAddModal = () => {
    setCrudMode('add')
    setTitle('')
    setAuthor('')
    setPrice('')
    setStockCount('')
    setShowCrudModal(true)
  }

  const openEditModal = (book, e) => {
    e.stopPropagation() // Stop triggering details window
    setCrudMode('edit')
    setBookId(book.book_id)
    setTitle(book.title)
    setAuthor(book.author)
    setPrice(book.price)
    setStockCount(book.stock_count)
    setShowCrudModal(true)
  }

  const handleCrudSubmit = (e) => {
    e.preventDefault()
    const url = crudMode === 'add' ? 'http://127.0.0.1:5000/api/books' : `http://127.0.0.1:5000/api/books/${bookId}`
    const method = crudMode === 'add' ? 'POST' : 'PUT'

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, price: parseFloat(price), stock_count: parseInt(stockCount) })
    })
      .then((res) => res.json())
      .then(() => {
        setShowCrudModal(false)
        fetchBooks(searchTerm)
      })
  }

  const handleDeleteBook = (id, e) => {
    e.stopPropagation()
    if(window.confirm("Are you sure you want to delete this book inventory record?")) {
      fetch(`http://127.0.0.1:5000/api/books/${id}`, { method: 'DELETE' })
        .then(() => fetchBooks(searchTerm))
    }
  }

  const handleViewDetails = (book) => {
    setSelectedBook(book)
    setShowDetailModal(true)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid credentials')
        return res.json()
      })
      .then((data) => {
        setIsLoggedIn(true)
        setUser(data.user)
        setShowLoginModal(false)
        setUsername('')
        setPassword('')
      })
      .catch((err) => setAuthError(err.message))
  }

  return (
    <div className="container">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="logo">📚 Elite Bookshop Portal</div>
        <div>
          {isLoggedIn ? (
            <div className="user-profile">
              <span className="role-badge">⭐ {user?.role.toUpperCase()}</span>
              <button className="add-inventory-btn" onClick={openAddModal}>+ Add New Item</button>
              <button className="logout-btn" onClick={() => { setIsLoggedIn(false); setUser(null); }}>Logout</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowLoginModal(true)}>Manager Login</button>
          )}
        </div>
      </nav>

      {/* Main Filter Command Bar */}
      <section className="search-bar-wrap">
        <form onSubmit={(e) => { e.preventDefault(); fetchBooks(searchTerm); }} className="search-box">
          <input 
            type="text" 
            placeholder="Search matching book titles or authors here..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="find-btn">Search</button>
          {searchTerm && <button type="button" className="reset-btn" onClick={() => { setSearchTerm(''); fetchBooks(''); }}>Clear</button>}
        </form>
      </section>

      {/* Rows Inventory Display Layout Grid */}
      {loading ? (
        <div className="status-msg">Accessing secure inventory nodes...</div>
      ) : books.length > 0 ? (
        <div className="rows-list-container">
          {books.map((book) => (
            <div key={book.book_id} className="row-item-card">
              <div className="media-placeholder-frame">
                <span className="book-cover-mock">📖</span>
              </div>
              
              <div className="card-mid-section">
                <h3>{book.title}</h3>
                <p className="author-label">By {book.author}</p>
                <p className="spec-tag-line">System ID: #{book.book_id} • Status: <span className="stock-counter">{book.stock_count} units left</span></p>
              </div>

              <div className="card-right-actions">
                <span className="catalog-price">${parseFloat(book.price).toFixed(2)}</span>
                <div className="btn-actions-cluster">
                  <button className="view-details-btn" onClick={() => handleViewDetails(book)}>View Details</button>
                  {isLoggedIn && user?.role === 'manager' && (
                    <>
                      <button className="edit-action-btn" onClick={(e) => openEditModal(book, e)}>Edit</button>
                      <button className="delete-action-btn" onClick={(e) => handleDeleteBook(book.book_id, e)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="status-msg">❌ No match found inside the current catalog data.</div>
      )}

      {/* MODAL 1: VIEW DETAILS POPUP */}
      {showDetailModal && selectedBook && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content text-left" onClick={(e) => e.stopPropagation()}>
            <h2>📖 Book Full Documentation</h2>
            <hr />
            <p><strong>Item Identifier Code:</strong> #{selectedBook.book_id}</p>
            <p><strong>Book Title:</strong> {selectedBook.title}</p>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>Database Set Value:</strong> ${parseFloat(selectedBook.price).toFixed(2)}</p>
            <p><strong>Warehouse Unit Inventory Count:</strong> {selectedBook.stock_count} units available</p>
            <button className="close-panel-btn" onClick={() => setShowDetailModal(false)}>Close Specifications</button>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGER CRUD FORM (ADD/EDIT) */}
      {showCrudModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{crudMode === 'add' ? '✨ Catalog: Add New Item Record' : '📝 Catalog: Modify Existing Record'}</h3>
            <form onSubmit={handleCrudSubmit}>
              <div className="form-group">
                <label>Book Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Author Name</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
              </div>
              <div className="form-group-split">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Stock Count</label>
                  <input type="number" value={stockCount} onChange={(e) => setStockCount(e.target.value)} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-record-btn">Save Parameters</button>
                <button type="button" className="cancel-record-btn" onClick={() => setShowCrudModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOGIN POPUP */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Secure Manager Gateway</h3>
            {authError && <div className="auth-error-msg">⚠️ {authError}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group"><label>Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
              <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <div className="modal-actions">
                <button type="submit" className="submit-login-btn">Authenticate</button>
                <button type="button" className="close-modal-btn" onClick={() => setShowLoginModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App