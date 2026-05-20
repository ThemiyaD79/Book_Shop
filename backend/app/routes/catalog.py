from flask import Blueprint, jsonify, request
from app.database import get_db_connection
from psycopg2.extras import RealDictCursor

catalog_bp = Blueprint('catalog', __name__)

@catalog_bp.route('/api/books', methods=['GET'])
def get_books():
    search_query = request.args.get('search', '').strip()
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        if search_query:
            sql = "SELECT * FROM books WHERE title ILIKE %s OR author ILIKE %s ORDER BY book_id DESC;"
            formatted_search = f"%{search_query}%"
            cursor.execute(sql, (formatted_search, formatted_search))
        else:
            cursor.execute('SELECT * FROM books ORDER BY book_id DESC;')
        books = cursor.fetchall()
        return jsonify({"status": "success", "data": books})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@catalog_bp.route('/api/books', methods=['POST'])
def add_book():
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    price = data.get('price')
    stock_count = data.get('stock_count')
    description = data.get('description', '')
    image_url = data.get('image_url', '')

    if not title or not author or price is None or stock_count is None:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        sql = """
            INSERT INTO books (title, author, price, stock_count, description, image_url) 
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING *;
        """
        cursor.execute(sql, (title, author, price, stock_count, description, image_url))
        new_book = cursor.fetchone()
        conn.commit()
        return jsonify({"status": "success", "data": new_book}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@catalog_bp.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    price = data.get('price')
    stock_count = data.get('stock_count')
    description = data.get('description')
    image_url = data.get('image_url')

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        sql = """
            UPDATE books 
            SET title = %s, author = %s, price = %s, stock_count = %s, description = %s, image_url = %s 
            WHERE book_id = %s RETURNING *;
        """
        cursor.execute(sql, (title, author, price, stock_count, description, image_url, book_id))
        updated_book = cursor.fetchone()
        conn.commit()
        return jsonify({"status": "success", "data": updated_book})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@catalog_bp.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM books WHERE book_id = %s;', (book_id,))
        conn.commit()
        return jsonify({"status": "success", "message": "Deleted"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()