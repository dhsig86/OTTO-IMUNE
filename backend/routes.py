from flask import Blueprint, request, jsonify
from models import db, Result

main = Blueprint('main', __name__)

@main.route('/submit', methods=['POST'])
def submit():
    data = request.json
    total_score = sum(data.values())
    result = Result(
        snot22=data['snot22'],
        vas=data['vas'],
        olfactory_test=data['olfactory_test'],
        previous_surgeries=data['previous_surgeries'],
        corticosteroid_use=data['corticosteroid_use'],
        polyp_size=data['polyp_size'],
        sinus_opacification=data['sinus_opacification'],
        asthma=data['asthma'],
        nsaid_intolerance=data['nsaid_intolerance'],
        serum_eosinophilia=data['serum_eosinophilia'],
        tissue_eosinophilia=data['tissue_eosinophilia'],
        total_score=total_score
    )
    db.session.add(result)
    db.session.commit()
    return jsonify({"total_score": total_score})
