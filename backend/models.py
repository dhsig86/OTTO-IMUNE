from sqlalchemy import create_engine, Column, Integer, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# Adapt DATABASE_URL if it uses posgres:// instead of postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class FormDataModel(Base):
    __tablename__ = "form_data"
    
    id = Column(Integer, primary_key=True, index=True)
    snot22 = Column(Integer, default=0)
    vas = Column(Integer, default=0)
    olfactory_test = Column(Integer, default=0)
    previous_surgeries = Column(Integer, default=0)
    corticosteroid_use = Column(Integer, default=0)
    polyp_size = Column(Integer, default=0)
    sinus_opacification = Column(Integer, default=0)
    asthma = Column(Integer, default=0)
    nsaid_intolerance = Column(Integer, default=0)
    serum_eosinophilia = Column(Integer, default=0)
    tissue_eosinophilia = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Ensure tables are created
Base.metadata.create_all(bind=engine)
