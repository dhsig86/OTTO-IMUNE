from flask import Flask
from flask_cors import CORS
from models import db, init_app
from routes import main

app = Flask(__name__)
init_app(app)
CORS(app)

app.register_blueprint(main)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
