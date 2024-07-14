from backend.app import db

class FormData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    snot22 = db.Column(db.Integer, nullable=False)
    vas = db.Column(db.Integer, nullable=False)
    olfactory_test = db.Column(db.Integer, nullable=False)
    previous_surgeries = db.Column(db.Integer, nullable=False)
    corticosteroid_use = db.Column(db.Integer, nullable=False)
    polyp_size = db.Column(db.Integer, nullable=False)
    sinus_opacification = db.Column(db.Integer, nullable=False)
    asthma = db.Column(db.Integer, nullable=False)
    nsaid_intolerance = db.Column(db.Integer, nullable=False)
    serum_eosinophilia = db.Column(db.Integer, nullable=False)
    tissue_eosinophilia = db.Column(db.Integer, nullable=False)
    total_score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
