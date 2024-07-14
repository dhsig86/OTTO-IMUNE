from flask import request, jsonify
from flask_cors import CORS
from backend.app import app, db
from backend.models import FormData

# Inicializando CORS
CORS(app)

@app.route('/submit', methods=['POST'])
def submit_form():
    data = request.get_json()
    snot22 = data.get('snot22')
    vas = data.get('vas')
    olfactory_test = data.get('olfactory_test')
    previous_surgeries = data.get('previous_surgeries')
    corticosteroid_use = data.get('corticosteroid_use')
    polyp_size = data.get('polyp_size')
    sinus_opacification = data.get('sinus_opacification')
    asthma = data.get('asthma')
    nsaid_intolerance = data.get('nsaid_intolerance')
    serum_eosinophilia = data.get('serum_eosinophilia')
    tissue_eosinophilia = data.get('tissue_eosinophilia')
    total_score = data.get('total_score')
    
    form_data = FormData(
        snot22=snot22,
        vas=vas,
        olfactory_test=olfactory_test,
        previous_surgeries=previous_surgeries,
        corticosteroid_use=corticosteroid_use,
        polyp_size=polyp_size,
        sinus_opacification=sinus_opacification,
        asthma=asthma,
        nsaid_intolerance=nsaid_intolerance,
        serum_eosinophilia=serum_eosinophilia,
        tissue_eosinophilia=tissue_eosinophilia,
        total_score=total_score
    )
    
    db.session.add(form_data)
    db.session.commit()
    
    return jsonify({"message": "Dados salvos com sucesso", "total_score": total_score}), 201
