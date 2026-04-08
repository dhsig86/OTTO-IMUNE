from backend.app import db

class FormData(db.Model):
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
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
