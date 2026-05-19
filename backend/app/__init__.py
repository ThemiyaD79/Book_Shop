from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # 1. Register the Catalog Blueprint
    from app.routes.catalog import catalog_bp
    app.register_blueprint(catalog_bp)
    
    # 2. Register the Auth Blueprint (Added this!)
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    
    return app