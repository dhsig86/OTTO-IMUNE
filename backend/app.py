from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)
app.config.from_object('config.Config')
db = SQLAlchemy(app)

from routes import *

if __name__ == '__main__':
    app.run()
