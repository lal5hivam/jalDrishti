"""
Configuration module for JalDrishti API
Manages data paths, cache settings, and application configuration.
"""

from pathlib import Path
from typing import Optional

class Settings:
    """Application settings and configuration"""
    
    # API Metadata
    API_TITLE = "JalDrishti Groundwater Intelligence API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = """
    🌊 **JalDrishti** - Production-ready backend for CGWB groundwater monitoring intelligence.
    
    ## Key Features
    - Station-normalized Groundwater Availability Index (GAVI)
    - Multi-layered alert system (Critical, Depletion, Recovery, Sudden Drop)
    - District and state-level stress analytics
    - Short-term (1y, 3y) trend-based forecasts
    - Policy-ready summaries and reports
    
    ## Data Coverage
    - **Timeline**: 2015-2024 (Annual observations)
    - **Stations**: ~10,000 CGWB monitoring wells
    - **States**: Pan-India coverage
    - **Methodology**: Station-normalized baseline + GAVI scoring
    
    All analytics are **precomputed offline** for maximum API performance.
    """
    
    # Paths
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = BASE_DIR / "output"
    
    # Data Files
    GAVI_ALERTS_FILE = DATA_DIR / "groundwater_gavi_alerts_2015_2024.csv"
    DISTRICT_STRESS_FILE = DATA_DIR / "district_stress_summary.csv"
    STATE_SUMMARY_FILE = DATA_DIR / "state_alert_summary.csv"
    FORECAST_FILE = DATA_DIR / "groundwater_forecast_gavi_alerts.csv"
    CRITICAL_FUTURE_FILE = DATA_DIR / "critical_future_alerts.csv"
    DISTRICT_FUTURE_FILE = DATA_DIR / "district_future_alerts.csv"
    BASELINE_FILE = DATA_DIR / "station_baseline.csv"
    
    # Cache settings
    ENABLE_CACHE = True
    CACHE_TTL_SECONDS = 3600  # 1 hour
    
    # CORS Settings
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",
        "*"  # Allow all for demo purposes
    ]
    
    # Pagination
    DEFAULT_PAGE_SIZE = 50
    MAX_PAGE_SIZE = 1000
    
    # Latest year (can be updated as new data is added)
    LATEST_YEAR = 2024


settings = Settings()
