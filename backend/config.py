import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql+psycopg2://uaocaj7ccifvvh:p8536c561b9afd9768915daa4d740ba44d34c5482288902378d7342c3bfff7db6@c9mq4861d16jlm.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dfnq2eh4nlm0ni')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
