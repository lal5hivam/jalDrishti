"""
Summary endpoints - National, District, and State level aggregated metrics.
These endpoints support high-level policy dashboards and decision-making.
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
import pandas as pd

from ..models import NationalSummaryResponse, DistrictStress, StateSummary
from ..services import DataService, get_data_service
from ..config import settings

router = APIRouter(prefix="/api/summary", tags=["Summary & Aggregations"])


@router.get("/national", response_model=NationalSummaryResponse)
async def get_national_summary(
    year: Optional[int] = Query(None, description="Year for assessment (defaults to latest)"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## National Groundwater Health Summary
    
    Returns high-level national statistics for groundwater stress assessment.
    
    **Use Case:** Executive dashboard, national policy briefing
    
    **Key Metrics:**
    - Total monitoring stations
    - % of stations under stress (GAVI < 50)
    - National average GAVI
    - Active critical alerts
    
    **Decision Support:** "What is the national groundwater situation?"
    """
    
    # Default to latest year if not specified
    if year is None:
        year = data_service.get_latest_year()
    
    # Get data for specified year
    df = data_service.get_gavi_alerts(year=year)
    
    if len(df) == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for year {year}"
        )
    
    # Get latest observation per station for the year
    latest_per_station = df.sort_values('DATE').groupby('station_id').tail(1)
    
    # Calculate metrics
    total_stations = latest_per_station['station_id'].nunique()
    stressed_stations = len(latest_per_station[latest_per_station['GAVI'] < 50])
    stressed_pct = (stressed_stations / total_stations * 100) if total_stations > 0 else 0
    avg_gavi = latest_per_station['GAVI'].mean()
    critical_alerts = len(latest_per_station[
        latest_per_station['ALERT_CONFIRMED'] == 'CRITICAL_GROUNDWATER'
    ])
    
    return NationalSummaryResponse(
        total_stations=total_stations,
        stressed_percentage=round(stressed_pct, 2),
        average_gavi=round(avg_gavi, 2),
        active_critical_alerts=critical_alerts,
        year=year
    )


@router.get("/districts", response_model=List[DistrictStress])
async def get_district_summary(
    state: Optional[str] = Query(None, description="Filter by state"),
    min_stressed_ratio: Optional[float] = Query(None, ge=0, le=100, description="Minimum stress ratio"),
    sort_by: str = Query("stressed_ratio", description="Sort field (stressed_ratio, avg_gavi, critical_alerts)"),
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Limit results"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## District-Level Stress Summary
    
    Returns stress metrics for all districts with optional filtering and sorting.
    
    **Use Case:** District prioritization, resource allocation planning
    
    **Stress Categories:**
    - **Safe**: < 20% stations stressed
    - **Watch**: 20-40% stressed
    - **Stressed**: 40-60% stressed
    - **Critical**: > 60% stressed
    
    **Decision Support:** "Which districts need immediate intervention?"
    """
    
    # Load district stress data
    df = data_service.get_district_stress()
    
    # Load future risk data and merge
    df_future = data_service.get_district_future()
    df = df.merge(
        df_future[['STATE_UT', 'DISTRICT', 'future_critical_1y']],
        on=['STATE_UT', 'DISTRICT'],
        how='left'
    )
    
    # Apply filters
    if state is not None:
        df = df[df['STATE_UT'] == state]
    
    if min_stressed_ratio is not None:
        df = df[df['stressed_ratio'] >= min_stressed_ratio]
    
    # Add stress category
    def categorize_stress(ratio):
        if ratio < 20:
            return "Safe"
        elif ratio < 40:
            return "Watch"
        elif ratio < 60:
            return "Stressed"
        else:
            return "Critical"
    
    df['stress_category'] = df['stressed_ratio'].apply(categorize_stress)
    
    # Add future risk flag
    def risk_flag(critical_count):
        if pd.isna(critical_count):
            return "LOW"
        if critical_count >= 3:
            return "HIGH"
        elif critical_count >= 1:
            return "MEDIUM"
        return "LOW"
    
    df['future_risk_flag'] = df['future_critical_1y'].apply(risk_flag)
    
    # Sort
    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=False)
    
    # Limit results
    if limit is not None:
        df = df.head(limit)
    
    # Convert to response model
    results = []
    for _, row in df.iterrows():
        results.append(DistrictStress(
            state=row['STATE_UT'],
            district=row['DISTRICT'],
            stressed_ratio=round(row['stressed_ratio'], 2),
            avg_gavi=round(row['avg_gavi'], 2),
            critical_alerts=int(row['critical_alerts']),
            depletion_alerts=int(row['depletion_alerts']) if 'depletion_alerts' in row else 0,
            total_stations=int(row['total_stations']),
            stress_category=row['stress_category'],
            future_risk_flag=row['future_risk_flag']
        ))
    
    return results


@router.get("/states", response_model=List[StateSummary])
async def get_state_summary(
    sort_by: str = Query("stressed_pct", description="Sort field"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## State-Level Aggregated Summary
    
    Returns aggregated metrics for each state/UT.
    
    **Use Case:** State-level policy comparison, resource distribution
    
    **Decision Support:** "Which states are most vulnerable?"
    """
    
    df = data_service.get_state_summary()
    
    # Sort
    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=False)
    
    # Convert to response model
    results = []
    for _, row in df.iterrows():
        results.append(StateSummary(
            state=row['STATE_UT'],
            total_stations=int(row['total_stations']),
            stressed_percentage=round(row['stressed_pct'], 2),
            avg_gavi=round(row['avg_gavi'], 2),
            critical_alerts=int(row['critical_count']) if 'critical_count' in row else 0,
            depletion_alerts=int(row['depletion_count']) if 'depletion_count' in row else 0,
            recovery_signals=int(row['recovery_count']) if 'recovery_count' in row else 0
        ))
    
    return results
