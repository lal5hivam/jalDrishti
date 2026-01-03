"""
Pydantic models for API request/response validation and serialization.
All models are designed for frontend consumption and policy reporting.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import date


# ==================== SUMMARY MODELS ====================

class NationalSummaryResponse(BaseModel):
    """National-level groundwater health summary"""
    total_stations: int = Field(..., description="Total DWLR monitoring stations")
    stressed_percentage: float = Field(..., description="% of stations with GAVI < 50")
    average_gavi: float = Field(..., description="National average GAVI score")
    active_critical_alerts: int = Field(..., description="Stations with critical groundwater")
    year: int = Field(..., description="Year of assessment")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_stations": 9547,
                "stressed_percentage": 45.2,
                "average_gavi": 52.3,
                "active_critical_alerts": 234,
                "year": 2024
            }
        }


class DistrictStress(BaseModel):
    """District-level stress metrics"""
    state: str
    district: str
    stressed_ratio: float = Field(..., description="% of stations stressed (GAVI < 50)")
    avg_gavi: float = Field(..., description="Average GAVI across all stations")
    critical_alerts: int = Field(..., description="Count of critical alerts")
    depletion_alerts: int = Field(0, description="Count of depletion warnings")
    total_stations: int = Field(..., description="Number of monitoring stations")
    stress_category: Optional[str] = Field(None, description="Safe/Watch/Stressed/Critical")
    future_risk_flag: Optional[str] = Field(None, description="LOW/MEDIUM/HIGH")
    
    class Config:
        json_schema_extra = {
            "example": {
                "state": "Uttar Pradesh",
                "district": "Prayagraj",
                "stressed_ratio": 68.5,
                "avg_gavi": 41.2,
                "critical_alerts": 12,
                "depletion_alerts": 8,
                "total_stations": 34,
                "stress_category": "Critical",
                "future_risk_flag": "HIGH"
            }
        }


class StateSummary(BaseModel):
    """State-level aggregated metrics"""
    state: str
    total_stations: int
    stressed_percentage: float = Field(..., description="% stations with GAVI < 50")
    avg_gavi: float
    critical_alerts: int
    depletion_alerts: int = 0
    recovery_signals: int = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "state": "Gujarat",
                "total_stations": 456,
                "stressed_percentage": 52.3,
                "avg_gavi": 48.7,
                "critical_alerts": 45,
                "depletion_alerts": 23,
                "recovery_signals": 12
            }
        }


# ==================== STATION MODELS ====================

class StationAlert(BaseModel):
    """Individual station alert data for map visualization"""
    station_id: str
    latitude: float
    longitude: float
    state: str
    district: str
    gavi: float
    gavi_category: str = Field(..., description="Safe/Watch/Stressed/Critical")
    alert: str = Field(..., description="Alert type (CRITICAL_GROUNDWATER, DEPLETION_WARNING, etc.)")
    severity: str = Field(..., description="CRITICAL/HIGH/MEDIUM/POSITIVE/NORMAL")
    wl_mbgl: float = Field(..., description="Water level in meters below ground level")
    delta_wl: Optional[float] = Field(None, description="Year-over-year change in WL")
    year: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "station_id": "Gujarat_22.4208_73.4194",
                "latitude": 22.4208,
                "longitude": 73.4194,
                "state": "Gujarat",
                "district": "Vadodara",
                "gavi": 23.4,
                "gavi_category": "Critical",
                "alert": "CRITICAL_GROUNDWATER",
                "severity": "CRITICAL",
                "wl_mbgl": 18.5,
                "delta_wl": -2.3,
                "year": 2024
            }
        }


class TimeSeriesPoint(BaseModel):
    """Single observation in station time series"""
    year: int
    wl_mbgl: float
    gavi: float
    alert: Optional[str] = None
    delta_wl: Optional[float] = None


class StationTimeSeries(BaseModel):
    """Complete time series + forecast for a single station"""
    station_id: str
    state: str
    district: str
    latitude: float
    longitude: float
    
    # Historical data
    historical: List[TimeSeriesPoint] = Field(..., description="Historical observations (2015-2024)")
    
    # Current status
    current_gavi: float
    current_alert: str
    current_year: int
    
    # Forecast data
    forecast_1y: Dict[str, float] = Field(
        ..., 
        description="1-year forecast: {wl, gavi, year}"
    )
    forecast_3y: Dict[str, float] = Field(
        ..., 
        description="3-year forecast: {wl, gavi, year}"
    )
    future_alert_1y: Optional[str] = None
    future_alert_3y: Optional[str] = None
    
    # Baseline context
    min_wl: float = Field(..., description="Historical minimum water level")
    max_wl: float = Field(..., description="Historical maximum water level")
    
    class Config:
        json_schema_extra = {
            "example": {
                "station_id": "Maharashtra_19.8167_76.8667",
                "state": "Maharashtra",
                "district": "Nanded",
                "latitude": 19.8167,
                "longitude": 76.8667,
                "historical": [
                    {"year": 2015, "wl_mbgl": 12.3, "gavi": 56.7, "alert": "NORMAL"},
                    {"year": 2016, "wl_mbgl": 14.1, "gavi": 48.2, "alert": "DEPLETION_WARNING"}
                ],
                "current_gavi": 41.2,
                "current_alert": "DEPLETION_WARNING",
                "current_year": 2024,
                "forecast_1y": {"wl": 15.8, "gavi": 38.5, "year": 2025},
                "forecast_3y": {"wl": 17.2, "gavi": 32.1, "year": 2027},
                "future_alert_1y": "FUTURE_CRITICAL",
                "future_alert_3y": "FUTURE_CRITICAL",
                "min_wl": 8.5,
                "max_wl": 18.2
            }
        }


# ==================== ALERT MODELS ====================

class CriticalAlertSummary(BaseModel):
    """Summary of critical and future alerts"""
    current_critical_count: int = Field(..., description="Stations currently critical (GAVI < 25)")
    future_critical_1y: int = Field(..., description="Stations predicted critical in 1 year")
    future_critical_3y: int = Field(..., description="Stations predicted critical in 3 years")
    top_affected_districts: List[Dict[str, Any]] = Field(
        ..., 
        description="Top 10 districts by critical alert count"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "current_critical_count": 234,
                "future_critical_1y": 187,
                "future_critical_3y": 312,
                "top_affected_districts": [
                    {
                        "state": "Uttar Pradesh",
                        "district": "Prayagraj",
                        "current_critical": 12,
                        "future_critical_1y": 8,
                        "stressed_ratio": 68.5
                    }
                ]
            }
        }


# ==================== GENERIC RESPONSES ====================

class APIInfo(BaseModel):
    """API metadata and available endpoints"""
    api_name: str
    version: str
    description: str
    endpoints: List[Dict[str, str]]


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    message: str
    details: Optional[str] = None
