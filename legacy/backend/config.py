import os

class Config:
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    if DATABASE_URL:
        print(f"Database URL: {DATABASE_URL}")
        SQLALCHEMY_DATABASE_URI = DATABASE_URL.replace('postgres://', 'postgresql+psycopg2://')
    else:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
