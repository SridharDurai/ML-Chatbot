import re
from dateutil.parser import parse
import datetime


def extract_dates(query):
    full_dates = re.findall(r'\d{4}-\d{2}-\d{2}', query)
    year_month = re.findall(r'\d{4}-\d{2}', query)
    years = re.findall(r'\b\d{4}\b', query)

    if len(full_dates) == 2:
        try:
            start_date = parse(full_dates[0]).date()
            end_date = parse(full_dates[1]).date()
            return start_date, end_date
        except ValueError as e:
            print(f"Error parsing full dates: {e}")

    if len(year_month) == 1:
        try:
            parsed_date = parse(year_month[0])
            start_date = datetime(parsed_date.year, parsed_date.month, 1).date()
            
            if parsed_date.month == 12:
                end_date = datetime(parsed_date.year, 12, 31).date()
            else:
                next_month = datetime(parsed_date.year, parsed_date.month + 1, 1).date()
                end_date = (next_month - timedelta(days=1)).date()
                
            return start_date, end_date
        except ValueError as e:
            print(f"Error parsing year and month: {e}")

    if len(years) == 1:
        try:
            start_date = parse(f"{years[0]}-01-01").date()
            end_date = parse(f"{years[0]}-12-31").date()
            return start_date, end_date
        except ValueError as e:
            print(f"Error parsing year: {e}")
    
    return None, None


def calculate_date_range(intent, query):
    print(intent)
    print(query)
    today = datetime.date.today()
    if intent == 'today':
        return today, today
    elif intent == 'yesterday':
        yesterday = today - datetime.timedelta(days=1)
        return yesterday, yesterday
    elif intent == 'last_week':
        last_week = today - datetime.timedelta(days=7)
        return last_week, today
    elif intent == 'last_week_claim_status':
        last_week = today - datetime.timedelta(days=7)
        return last_week, today
    elif intent == 'last_month':
        first_day_of_current_month = today.replace(day=1)
        last_month = first_day_of_current_month - datetime.timedelta(days=1)
        first_day_of_last_month = last_month.replace(day=1)
        return first_day_of_last_month, last_month
    elif intent == 'last_year':
        first_day_of_last_year = datetime.date(today.year - 1, 1, 1)
        last_day_of_last_year = datetime.date(today.year - 1, 12, 31)
        return first_day_of_last_year, last_day_of_last_year
    elif intent == 'from_last_year_claim_status':
        first_day_of_last_year = datetime.date(today.year - 1, 1, 1)
        last_day_of_last_year = datetime.date(today.year - 1, 12, 31)
        return first_day_of_last_year, last_day_of_last_year
    elif intent == 'date_range':
        start_date, end_date = extract_dates(query)
        if start_date and end_date:
            return start_date, end_date
        else:
            raise ValueError("Invalid date format in query")
    else:
        raise ValueError("Unsupported intent")