from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Certifique-se de importar o CORS

app = Flask(__name__)
CORS(app)  # Habilitando CORS para o aplicativo

app.config.from_object('config.Config')

db = SQLAlchemy(app)

from routes import *  # Certifique-se de que o caminho esteja correto

if __name__ == '__main__':
    app.run()
