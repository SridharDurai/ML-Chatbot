from flask import Blueprint
from flask import request, jsonify
from services.claims_service import get_claims_count
from db import db

api = Blueprint('api', __name__)

@api.route('/claims-count', methods=['POST'])
def claims_count():
    return get_claims_count()
