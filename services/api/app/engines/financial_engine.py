import math


def financial_summary(metrics) -> dict:
    ordered = sorted(metrics, key=lambda item: item.month)
    if not ordered:
        return {
            "latest_revenue": 0,
            "latest_burn": 0,
            "latest_cash_balance": 0,
            "runway_months": 0,
            "revenue_growth_percent": 0,
            "gross_margin_change": 0,
            "burn_increase_percent": 0,
        }
    first, latest = ordered[0], ordered[-1]
    runway = latest.cash_balance / latest.burn if latest.burn else 0
    revenue_growth = ((latest.revenue - first.revenue) / first.revenue * 100) if first.revenue else 0
    burn_increase = ((latest.burn - first.burn) / first.burn * 100) if first.burn else 0
    return {
        "latest_revenue": latest.revenue,
        "latest_burn": latest.burn,
        "latest_cash_balance": latest.cash_balance,
        # Conservative display: do not round a partial month upward.
        "runway_months": math.floor(runway * 10) / 10,
        "revenue_growth_percent": round(revenue_growth, 1),
        "gross_margin_change": round(latest.gross_margin - first.gross_margin, 2),
        "burn_increase_percent": round(burn_increase, 1),
        "first_gross_margin": first.gross_margin,
        "latest_gross_margin": latest.gross_margin,
        "first_burn": first.burn,
    }
