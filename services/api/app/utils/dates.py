from datetime import date, timedelta


def due_date(days_from_now: int) -> str:
    return (date.today() + timedelta(days=days_from_now)).isoformat()
