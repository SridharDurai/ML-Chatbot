from flask import Flask
from flask_cors import CORS
from config import Config
from config.db import db  

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)  
CORS(app)

def register_blueprints():
    from routes import api  
    app.register_blueprint(api)

register_blueprints()

if __name__ == '__main__':
    app.run(debug=True)
