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
  const [crudMode, setCrudMode] = useState('add')
  
  // Form Input States
  const [bookId, setBookId] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [price, setPrice] = useState('')
  const [stockCount, setStockCount] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Central Inventory Loader API Link Data stream
  const fetchBooks = (query = '') => {
    setLoading(true)
    const url = query 
      ? `http://127.0.0.1:5000/api/books?search=${encodeURIComponent(query)}`
      : 'http://127.0.0.1:5000/api/books'
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Could not access remote API engine nodes.')
        return res.json()
      })
      .then((payload) => {
        setBooks(payload.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  // Live Observer tracking searchTerm variations to fire instant matching queries
  useEffect(() => {
    fetchBooks(searchTerm)
  }, [searchTerm])

  // Helper function to convert raw image file from disk array into a clean Base64 data string
  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Admin Operational Modal View Openers
  const openAddModal = () => {
    setCrudMode('add')
    setTitle('')
    setAuthor('')
    setPrice('')
    setStockCount('')
    setDescription('')
    setImageUrl('')
    setShowCrudModal(true)
  }

  const openEditModal = (book, e) => {
    e.stopPropagation()
    setCrudMode('edit')
    setBookId(book.book_id)
    setTitle(book.title)
    setAuthor(book.author)
    setPrice(book.price)
    setStockCount(book.stock_count)
    setDescription(book.description || '')
    setImageUrl(book.image_url || '')
    setShowCrudModal(true)
  }

  // Handle Form Submission Transactions (POST & PUT requests)
  const handleCrudSubmit = (e) => {
    e.preventDefault()
    const url = crudMode === 'add' ? 'http://127.0.0.1:5000/api/books' : `http://127.0.0.1:5000/api/books/${bookId}`
    const method = crudMode === 'add' ? 'POST' : 'PUT'

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        author, 
        price: parseFloat(price), 
        stock_count: parseInt(stockCount),
        description,
        image_url: imageUrl
      })
    })
      .then((res) => res.json())
      .then(() => {
        setShowCrudModal(false)
        fetchBooks(searchTerm)
      })
      .catch((err) => alert("Form sync transaction failed: " + err.message))
  }

  // Handle Inventory Row Record Deletions (DELETE requests)
  const handleDeleteBook = (id, e) => {
    e.stopPropagation()
    if(window.confirm("Are you sure you want to permanently delete this book entry from database records?")) {
      fetch(`http://127.0.0.1:5000/api/books/${id}`, { method: 'DELETE' })
        .then(() => fetchBooks(searchTerm))
    }
  }

  const handleViewDetails = (book) => {
    setSelectedBook(book)
    setShowDetailModal(true)
  }

  // Handle Administration Gateway Account Authentication
  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid manager gateway credentials.')
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

  if (error) return <div className="status-msg">⚠️ System Error Connection Refused: {error}</div>

  return (
    <div className="bookshop-master-container">
      {/* Top Application Header Navigation Bar */}
      <nav className="navbar">
        <div className="logo">📚 Flourish and Blotts Bookshop Portal</div>
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

      {/* Central Database Filter Query Search Box */}
      <section className="search-bar-wrap">
        <form onSubmit={(e) => e.preventDefault()} className="search-box">
          <input 
            type="text" 
            placeholder="Search matching book titles or authors here..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button type="button" className="reset-btn" onClick={() => setSearchTerm('')}>Clear</button>}
        </form>
      </section>

      {/* Main Structural Rows Layout List Panel */}
      {loading ? (
        <div className="status-msg">Accessing secure inventory nodes...</div>
      ) : books.length > 0 ? (
        <div className="rows-list-container">
          {books.map((book) => (
            <div key={book.book_id} className="row-item-card" onClick={() => handleViewDetails(book)}>
              <div className="media-placeholder-frame">
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} className="row-cover-img" />
                ) : (
                  <span className="book-cover-mock">📖</span>
                )}
              </div>
              
              <div className="card-mid-section">
                <h3>{book.title}</h3>
                <p className="author-label">By {book.author}</p>
                <p className="spec-tag-line">System ID: #{book.book_id} • Status: <span className="stock-counter">{book.stock_count} units left</span></p>
              </div>

              <div className="card-right-actions">
                <span className="catalog-price">${parseFloat(book.price).toFixed(2)}</span>
                <div className="btn-actions-cluster">
                  <button className="view-details-btn">View Details</button>
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

      {/* OVERLAY PANEL 1: MULTI-COLUMN POPUP DRAWER LAYOUT */}
      {showDetailModal && selectedBook && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-layout-split">
              <div className="detail-left-cover">
                {selectedBook.image_url ? (
                  <img src={selectedBook.image_url} alt={selectedBook.title} className="detail-showcase-img" />
                ) : (
                  <div className="detail-fallback-cover">📖</div>
                )}
              </div>
              <div className="detail-right-info">
                <span className="detail-id-tag">Inventory ID: #{selectedBook.book_id}</span>
                <h2>{selectedBook.title}</h2>
                <h4 className="detail-author">By {selectedBook.author}</h4>
                <hr />
                <div className="detail-meta-row">
                  <div>
                    <label>Price</label>
                    <p className="detail-price-txt">${parseFloat(selectedBook.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <label>Stock Status</label>
                    <p className="detail-stock-txt">{selectedBook.stock_count} copies available</p>
                  </div>
                </div>
                <hr />
                <div className="detail-desc-block">
                  <label>Book Description</label>
                  <p>{selectedBook.description || "No catalog description available for this item yet."}</p>
                </div>
                <button className="detail-close-action-btn" onClick={() => setShowDetailModal(false)}>Back to Catalog</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY PANEL 2: MANAGER DATA MANAGEMENT FORM LAYOUT */}
      {showCrudModal && (
        <div className="modal-overlay">
          <div className="modal-content custom-scroll-form">
            <h3>{crudMode === 'add' ? '✨ Add New Book Record' : '📝 Modify Existing Record'}</h3>
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
              
              <div className="form-group">
                <label>Upload Machine Image file (.jpg / .png)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageFileChange} 
                  className="file-upload-input"
                />
                {imageUrl && (
                  <div className="image-form-preview-frame">
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0' }}>Selected Cover Image Thumbnail:</p>
                    <img src={imageUrl} alt="Thumbnail Preview" className="form-preview-thumbnail" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Book Description</label>
                <textarea 
                  rows="4" 
                  placeholder="Enter full summary narration here..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="form-textarea" 
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-record-btn">Save Parameters</button>
                <button type="button" className="cancel-record-btn" onClick={() => setShowCrudModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY PANEL 3: SECURE LOGIN PANEL GATEWAY WITH THE REAL DEVELOPER MEME VALIDATOR */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Secure Manager Gateway</h3>
            {authError && <div className="auth-error-msg">⚠️ {authError}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>

              {/* THE DEVELOPER MEME FEEDBACK ROW FROM DISK CLIPS */}
              {password.length > 0 && (
                <div className="meme-validator-row">
                  <span className="meme-arrow">➡️</span>
                  {password.split('').map((char, index) => {
                    const targetPassword = "admin123"; // Exact string matching sequence logic
                    const isCorrect = char === targetPassword[index];
                    return (
                      <span key={index} className="meme-emoji">
                        {isCorrect ? '✔️' : '❌'}
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="submit-login-btn">Login</button>
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