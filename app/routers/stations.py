"""
Station endpoints - Individual station data, alerts, and time series.
These endpoints support granular well-level monitoring and analysis.
"""

from fastapi import APIRouter, Query, HTTPException, Path, Depends
from typing import List, Optional
import pandas as pd

from ..models import StationAlert, StationTimeSeries, TimeSeriesPoint
from ..services import DataService, get_data_service

router = APIRouter(prefix="/api/stations", tags=["Station-Level Data"])


@router.get("/alerts", response_model=List[StationAlert])
async def get_station_alerts(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    alert_type: Optional[str] = Query(
        None, 
        description="Filter by alert type (CRITICAL_GROUNDWATER, DEPLETION_WARNING, SUDDEN_DROP, RECOVERY_SIGNAL, NORMAL)"
    ),
    year: Optional[int] = Query(None, description="Year (defaults to latest)"),
    limit: Optional[int] = Query(500, ge=1, le=10000, description="Maximum results"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## Station Alert Map Data
    
    Returns individual station locations with current alert status.
    
    **Use Case:** Interactive map visualization, geospatial analysis
    
    **Alert Types:**
    - 🔴 **CRITICAL_GROUNDWATER**: GAVI < 25
    - 🟠 **DEPLETION_WARNING**: GAVI < 50 AND declining
    - 🟡 **SUDDEN_DROP**: Sharp decline (≤ -2m)
    - 🟢 **RECOVERY_SIGNAL**: Significant improvement (≥ +1m)
    - ⚪ **NORMAL**: Stable condition
    
    **Decision Support:** "Where are the failing wells?"
    """
    
    # Default to latest year
    if year is None:
        year = data_service.get_latest_year()
    
    # Get data
    df = data_service.get_gavi_alerts(year=year)
    
    # Get latest observation per station for the year
    df_latest = df.sort_values('DATE').groupby('station_id').tail(1).copy()
    
    # Apply filters
    if state is not None:
        df_latest = df_latest[df_latest['STATE_UT'] == state]
    
    if district is not None:
        df_latest = df_latest[df_latest['DISTRICT'] == district]
    
    if alert_type is not None:
        df_latest = df_latest[df_latest['ALERT_CONFIRMED'] == alert_type]
    
    # Filter valid coordinates
    df_latest = df_latest[
        (df_latest['LATITUDE'].notna()) & 
        (df_latest['LONGITUDE'].notna()) &
        (df_latest['LATITUDE'] != 0) &
        (df_latest['LONGITUDE'] != 0)
    ]
    
    # Limit results
    df_latest = df_latest.head(limit)
    
    # Convert to response model
    results = []
    for _, row in df_latest.iterrows():
        results.append(StationAlert(
            station_id=row['station_id'],
            latitude=float(row['LATITUDE']),
            longitude=float(row['LONGITUDE']),
            state=row['STATE_UT'],
            district=row['DISTRICT'],
            gavi=round(float(row['GAVI']), 2),
            gavi_category=row['GAVI_CATEGORY'],
            alert=row['ALERT_CONFIRMED'],
            severity=row['ALERT_SEVERITY'],
            wl_mbgl=round(float(row['WL_MBGL']), 2),
            delta_wl=round(float(row['delta_wl']), 2) if pd.notna(row['delta_wl']) else None,
            year=int(row['year'])
        ))
    
    return results


@router.get("/{station_id}/timeseries", response_model=StationTimeSeries)
async def get_station_timeseries(
    station_id: str = Path(..., description="Station identifier"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## Station Time Series + Forecast
    
    Returns complete historical data and future forecasts for a single station.
    
    **Use Case:** Detailed station analysis, trend visualization, forecast validation
    
    **Includes:**
    - Historical WL & GAVI (2015-2024)
    - 1-year and 3-year forecasts
    - Alert history
    - Baseline context (min/max WL)
    
    **Decision Support:** "Why is this station failing? What happens next?"
    """
    
    # Get historical data
    historical_df = data_service.get_station_timeseries(station_id)
    
    if historical_df is None or len(historical_df) == 0:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station_id}' not found"
        )
    
    # Get forecast data
    forecast_df = data_service.get_forecast(station_id=station_id)
    
    if len(forecast_df) == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No forecast data available for station '{station_id}'"
        )
    
    # Extract station metadata
    latest = historical_df.iloc[-1]
    forecast_row = forecast_df.iloc[0]
    
    # Build historical time series
    historical_points = []
    for _, row in historical_df.iterrows():
        historical_points.append(TimeSeriesPoint(
            year=int(row['year']),
            wl_mbgl=round(float(row['WL_MBGL']), 2),
            gavi=round(float(row['GAVI']), 2),
            alert=row['ALERT_CONFIRMED'] if pd.notna(row['ALERT_CONFIRMED']) else None,
            delta_wl=round(float(row['delta_wl']), 2) if pd.notna(row['delta_wl']) else None
        ))
    
    # Build forecast dictionaries
    current_year = int(latest['year'])
    
    forecast_1y = {
        "year": current_year + 1,
        "wl": round(float(forecast_row['WL_forecast_1y']), 2),
        "gavi": round(float(forecast_row['GAVI_forecast_1y']), 2)
    }
    
    forecast_3y = {
        "year": current_year + 3,
        "wl": round(float(forecast_row['WL_forecast_3y']), 2),
        "gavi": round(float(forecast_row['GAVI_forecast_3y']), 2)
    }
    
    return StationTimeSeries(
        station_id=station_id,
        state=latest['STATE_UT'],
        district=latest['DISTRICT'],
        latitude=float(latest['LATITUDE']),
        longitude=float(latest['LONGITUDE']),
        historical=historical_points,
        current_gavi=round(float(latest['GAVI']), 2),
        current_alert=latest['ALERT_CONFIRMED'],
        current_year=current_year,
        forecast_1y=forecast_1y,
        forecast_3y=forecast_3y,
        future_alert_1y=forecast_row['FUTURE_ALERT_1y'] if pd.notna(forecast_row['FUTURE_ALERT_1y']) else None,
        future_alert_3y=forecast_row['FUTURE_ALERT_3y'] if pd.notna(forecast_row['FUTURE_ALERT_3y']) else None,
        min_wl=round(float(forecast_row['min_wl']), 2),
        max_wl=round(float(forecast_row['max_wl']), 2)
    )


@router.get("/list")
async def list_stations(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## List All Stations
    
    Returns list of all station IDs with basic metadata.
    
    **Use Case:** Station selection, autocomplete, data exploration
    """
    
    df = data_service.get_latest_year_data()
    
    # Apply filters
    if state is not None:
        df = df[df['STATE_UT'] == state]
    
    if district is not None:
        df = df[df['DISTRICT'] == district]
    
    # Extract unique stations
    stations = df[['station_id', 'STATE_UT', 'DISTRICT', 'LATITUDE', 'LONGITUDE']].drop_duplicates()
    
    # Replace NaN with None for JSON compliance
    stations_data = stations.replace({pd.NA: None, pd.NaT: None}).fillna(value=None).to_dict(orient='records')
    
    return {
        "total_stations": len(stations),
        "stations": stations_data
    }
