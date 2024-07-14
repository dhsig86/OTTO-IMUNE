from flask import Flask, request, jsonify
from models import db, Questionnaire
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

@app.route('/')
def home():
    return "Servidor Flask está rodando!"

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    total_score = sum([
        data['snot22'], data['vas'], data['olfactory_test'], 
        data['previous_surgeries'], data['surgery_contraindication'],
        data['corticosteroid_use'], data['polyp_size'], data['sinus_opacification'],
        data['asthma'], data['nsaid_intolerance'], data['serum_eosinophilia'],
        data['tissue_eosinophilia']
    ])
    
    questionnaire = Questionnaire(
        snot22=data['snot22'],
        vas=data['vas'],
        olfactory_test=data['olfactory_test'],
        previous_surgeries=data['previous_surgeries'],
        surgery_contraindication=data['surgery_contraindication'],
        corticosteroid_use=data['corticosteroid_use'],
        polyp_size=data['polyp_size'],
        sinus_opacification=data['sinus_opacification'],
        asthma=data['asthma'],
        nsaid_intolerance=data['nsaid_intolerance'],
        serum_eosinophilia=data['serum_eosinophilia'],
        tissue_eosinophilia=data['tissue_eosinophilia'],
        total_score=total_score
    )
    
    db.session.add(questionnaire)
    db.session.commit()
    
    return jsonify({'total_score': total_score})

if __name__ == '__main__':
    app.run(debug=True)
