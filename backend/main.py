from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.models import SessionLocal, FormDataModel

app = FastAPI(title="OTTO-IMUNE API")

# Update CORS later properly for the OTTO Ecosystem Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class EligibilitySubmit(BaseModel):
    snot22: int
    vas: int
    olfactory_test: int
    previous_surgeries: int
    corticosteroid_use: int
    polyp_size: int
    sinus_opacification: int
    asthma: int
    nsaid_intolerance: int
    serum_eosinophilia: int
    tissue_eosinophilia: int
    total_score: int

@app.get("/")
def health_check():
    return {"status": "ok", "service": "OTTO-IMUNE API"}

@app.post("/submit")
def submit_eligibility(data: EligibilitySubmit, db: Session = Depends(get_db)):
    try:
        db_item = FormDataModel(
            snot22=data.snot22,
            vas=data.vas,
            olfactory_test=data.olfactory_test,
            previous_surgeries=data.previous_surgeries,
            corticosteroid_use=data.corticosteroid_use,
            polyp_size=data.polyp_size,
            sinus_opacification=data.sinus_opacification,
            asthma=data.asthma,
            nsaid_intolerance=data.nsaid_intolerance,
            serum_eosinophilia=data.serum_eosinophilia,
            tissue_eosinophilia=data.tissue_eosinophilia,
            total_score=data.total_score
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return {"message": "Data submitted successfully", "id": db_item.id, "total_score": db_item.total_score}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
