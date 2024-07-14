from flask import request, jsonify
from flask_cors import CORS
from backend.app import app, db
from backend.models import FormData

CORS(app)

@app.route('/submit', methods=['POST'])
def submit_form():
    data = request.get_json()
    form_data = FormData(
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
    
    return jsonify({"message": "Dados salvos com sucesso", "total_score": data.get('total_score', 0)}), 201
