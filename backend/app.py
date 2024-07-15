import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Adiciona o caminho 'backend' ao sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, static_folder='../frontend', static_url_path='', template_folder='../frontend')
app.config.from_object('backend.config.Config')

db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)

# Importa os modelos após a inicialização do db
import backend.models

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.get_json()
        app.logger.debug(f"Received data: {data}")

        form_data = backend.models.FormData(
            snot22=data.get('snot22', 0),
            vas=data.get('vas', 0),
            olfactory_test=data.get('olfactory_test', 0),
            previous_surgeries=data.get('previous_surgeries', 0),
            corticosteroid_use=data.get('corticosteroid_use', 0),
            polyp_size=data.get('polyp_size', 0),
            sinus_opacification=data.get('sinus_opacification', 0),
            asthma=data.get('asthma', 0),
            nsaid_intolerance=data.get('nsaid_intolerance', 0),
            serum_eosinophilia=data.get('serum_eosinophilia', 0),
            tissue_eosinophilia=data.get('tissue_eosinophilia', 0),
            total_score=data.get('total_score', 0)
        )

        db.session.add(form_data)
        db.session.commit()
        app.logger.debug(f"Form data saved: {form_data}")

        return jsonify({'message': 'Data submitted successfully', 'total_score': form_data.total_score}), 201
    except Exception as e:
        app.logger.error(f"Error during submission: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
