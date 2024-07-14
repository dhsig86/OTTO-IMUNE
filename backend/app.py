from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config.from_object('backend.config.Config')

print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])

db = SQLAlchemy(app)

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    snot22 = db.Column(db.Integer)
    vas = db.Column(db.Integer)
    olfactory_test = db.Column(db.Integer)
    previous_surgeries = db.Column(db.Integer)
    corticosteroid_use = db.Column(db.Integer)
    polyp_size = db.Column(db.Integer)
    sinus_opacification = db.Column(db.Integer)
    asthma = db.Column(db.Integer)
    nsaid_intolerance = db.Column(db.Integer)
    serum_eosinophilia = db.Column(db.Integer)
    tissue_eosinophilia = db.Column(db.Integer)
    total_score = db.Column(db.Integer)
    timestamp = db.Column(db.String)

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.get_json()

        new_submission = Submission(
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
            total_score=data.get('total_score', 0),
            timestamp=data.get('timestamp')
        )

        db.session.add(new_submission)
        db.session.commit()

        return jsonify({"total_score": new_submission.total_score}), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run()
