from flask import Blueprint, request, jsonify
from app.database import get_db_connection
from psycopg2.extras import RealDictCursor

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password') # In a production app, we would hash/verify this

    if not username or not password:
        return jsonify({"status": "error", "message": "Missing username or password"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Look up the user in the database
        cursor.execute('SELECT user_id, username, password_hash, role FROM users WHERE username = %s;', (username,))
        user = cursor.fetchone()

        if user and user['password_hash'] == password: # Simple matching for this milestone
            if user['role'] == 'manager':
                return jsonify({
                    "status": "success",
                    "message": "Welcome back, Manager!",
                    "user": {
                        "username": user['username'],
                        "role": user['role']
                    }
                }), 200
            else:
                return jsonify({"status": "error", "message": "Access denied. Managers only."}), 403
        
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()