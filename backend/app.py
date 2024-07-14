from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config.from_object('backend.config.Config')

db = SQLAlchemy(app)

from backend import routes  # Certifique-se de que o caminho esteja correto

if __name__ == '__main__':
    app.run()
