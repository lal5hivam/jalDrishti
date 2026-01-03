"""
Alert endpoints - Critical alerts and future risk analysis.
These endpoints support early warning systems and proactive policy interventions.
"""

from fastapi import APIRouter, Query, Depends
from typing import List, Optional

from ..models import CriticalAlertSummary
from ..services import DataService, get_data_service

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Early Warning"])


@router.get("/critical", response_model=CriticalAlertSummary)
async def get_critical_alerts(
    data_service: DataService = Depends(get_data_service)
):
    """
    ## Critical & Future Alert Summary
    
    Returns comprehensive summary of current and predicted critical conditions.
    
    **Use Case:** Early warning dashboard, risk assessment, emergency planning
    
    **Key Intelligence:**
    - Current critical stations (GAVI < 25)
    - Predicted critical stations (1-year and 3-year horizon)
    - Top affected districts requiring intervention
    
    **Decision Support:** "What's the current crisis? What's coming next?"
    
    **Innovation:** 🔥 This is anticipation, not just detection - policy makers can act BEFORE crisis hits.
    """
    
    # Get latest year data for current critical count
    latest_df = data_service.get_latest_year_data()
    current_critical = len(latest_df[latest_df['ALERT_CONFIRMED'] == 'CRITICAL_GROUNDWATER'])
    
    # Get forecast data for future predictions
    forecast_df = data_service.get_forecast()
    future_critical_1y = len(forecast_df[forecast_df['FUTURE_ALERT_1y'] == 'FUTURE_CRITICAL'])
    future_critical_3y = len(forecast_df[forecast_df['FUTURE_ALERT_3y'] == 'FUTURE_CRITICAL'])
    
    # Get district-level aggregation for top affected
    district_df = data_service.get_district_stress()
    district_future_df = data_service.get_district_future()
    
    # Merge current and future data
    district_combined = district_df.merge(
        district_future_df[['STATE_UT', 'DISTRICT', 'future_critical_1y']],
        on=['STATE_UT', 'DISTRICT'],
        how='left'
    )
    
    # Sort by critical alerts and get top 10
    top_districts = district_combined.nlargest(10, 'critical_alerts')
    
    top_affected_list = []
    for _, row in top_districts.iterrows():
        top_affected_list.append({
            "state": row['STATE_UT'],
            "district": row['DISTRICT'],
            "current_critical": int(row['critical_alerts']),
            "future_critical_1y": int(row['future_critical_1y']) if 'future_critical_1y' in row and not row['future_critical_1y'] != row['future_critical_1y'] else 0,  # Check for NaN
            "stressed_ratio": round(float(row['stressed_ratio']), 2),
            "avg_gavi": round(float(row['avg_gavi']), 2)
        })
    
    return CriticalAlertSummary(
        current_critical_count=current_critical,
        future_critical_1y=future_critical_1y,
        future_critical_3y=future_critical_3y,
        top_affected_districts=top_affected_list
    )


@router.get("/by-type")
async def get_alerts_by_type(
    year: Optional[int] = Query(None, description="Year (defaults to latest)"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## Alert Distribution by Type
    
    Returns count and percentage of each alert type.
    
    **Use Case:** Alert system validation, communication planning
    
    **Decision Support:** "What's the breakdown of alert severity?"
    """
    
    # Default to latest year
    if year is None:
        year = data_service.get_latest_year()
    
    # Get latest data per station for the year
    df = data_service.get_gavi_alerts(year=year)
    latest_df = df.sort_values('DATE').groupby('station_id').tail(1)
    
    # Count by alert type
    alert_counts = latest_df['ALERT_CONFIRMED'].value_counts().to_dict()
    total = len(latest_df)
    
    # Calculate percentages
    alert_distribution = {}
    for alert_type, count in alert_counts.items():
        alert_distribution[alert_type] = {
            "count": int(count),
            "percentage": round((count / total * 100), 2)
        }
    
    return {
        "year": year,
        "total_stations": total,
        "alert_distribution": alert_distribution
    }


@router.get("/future-risk")
async def get_future_risk_analysis(
    horizon: str = Query("1y", description="Forecast horizon (1y or 3y)"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## Future Risk Analysis
    
    Returns detailed breakdown of predicted future alerts.
    
    **Use Case:** Long-term planning, budget allocation, preventive measures
    
    **Decision Support:** "What interventions should we plan for?"
    """
    
    forecast_df = data_service.get_forecast()
    
    # Select appropriate forecast column
    alert_col = 'FUTURE_ALERT_1y' if horizon == '1y' else 'FUTURE_ALERT_3y'
    
    # Count by future alert type
    future_counts = forecast_df[alert_col].value_counts().to_dict()
    total = len(forecast_df)
    
    # Calculate percentages
    future_distribution = {}
    for alert_type, count in future_counts.items():
        future_distribution[alert_type] = {
            "count": int(count),
            "percentage": round((count / total * 100), 2)
        }
    
    # Get state-level aggregation
    state_future = forecast_df.groupby('STATE_UT')[alert_col].apply(
        lambda x: (x == 'FUTURE_CRITICAL').sum()
    ).nlargest(10).to_dict()
    
    return {
        "horizon": horizon,
        "total_stations": total,
        "future_alert_distribution": future_distribution,
        "top_10_states_at_risk": state_future
    }
