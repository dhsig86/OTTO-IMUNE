from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Carregando a configuração da classe Config
app.config.from_object('backend.config.Config')

# Verificar string de conexão do banco de dados
print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])

db = SQLAlchemy(app)

from backend import routes

if __name__ == '__main__':
    app.run()
