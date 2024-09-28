import os

class Config:
    DATABASE_URL = os.getenv('DATABASE_URL', 'mssql+pyodbc://amcs_user:%40lph%40mcs11@3.93.22.237/alphamcs_shc?driver=ODBC+Driver+17+for+SQL+Server')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

