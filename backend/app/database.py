import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    # Establishes a direct connection to your PostgreSQL bookshop database
    conn = psycopg2.connect(
        host="localhost",
        database="bookshop_db",
        user="postgres",
        password="Themiya",  # ⬅️ Replace this with your actual pgAdmin master password!
        port="5432"
    )
    return conn