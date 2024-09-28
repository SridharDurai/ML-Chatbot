from flask import request, jsonify
from db_models import Claims
from utils.logging_util import setup_logging
from utils.date_util import calculate_date_range
from services.nlp_service import classify_intent

logging = setup_logging()

def get_claims_count():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")

        if not data or 'query' not in data:
            logging.error("Invalid input data: Missing 'query' field")
            return jsonify({'error': 'Please provide a valid input'}), 400

        query = data['query']
        intent = classify_intent(query)
        logging.info(f"Classified intent: {intent}")

        start_date, end_date = calculate_date_range(intent, query)
        logging.info(f"Querying data from {start_date} to {end_date}")

        approved_count = Claims.query.filter(
            Claims.last_upd_dt.between(start_date, end_date),
            Claims.stat_id == 1,
            Claims.curnt_entry == 1
        ).count()

        denied_count = Claims.query.filter(
            Claims.last_upd_dt.between(start_date, end_date),
            Claims.stat_id != 1,
            Claims.curnt_entry == 1
        ).count()

        logging.info(f"Approved: {approved_count}, Denied: {denied_count}")

        return jsonify({
            'total': approved_count + denied_count,
            'approved': approved_count,
            'denied': denied_count
        }), 200

    except Exception as e:
        logging.error(f"Error processing claims count: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500
