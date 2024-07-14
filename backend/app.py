from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config.from_object('config.Config')
db = SQLAlchemy(app)

# Importar rotas após inicialização do app e db
from routes import *from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config.from_object('config.Config')
db = SQLAlchemy(app)

# Importar rotas após inicialização do app e db
from routes import *

if __name__ == '__main__':
    app.run()


if __name__ == '__main__':
    app.run()
