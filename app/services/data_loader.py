"""
Data Loading Service
Loads all precomputed CSV datasets into memory at startup with caching.
All heavy computation is already done offline - this service just loads and serves data.
"""

import pandas as pd
from pathlib import Path
from typing import Dict, Optional
import logging
from functools import lru_cache

from ..config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoadingError(Exception):
    """Raised when data files cannot be loaded"""
    pass


class DataService:
    """
    Singleton service for loading and caching groundwater datasets.
    All data is loaded once at application startup for maximum performance.
    """
    
    _instance = None
    _data_cache: Dict[str, pd.DataFrame] = {}
    _loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._loaded:
            self.load_all_datasets()
            self._loaded = True
    
    def load_all_datasets(self):
        """Load all precomputed CSV files into memory"""
        logger.info("🔄 Loading groundwater datasets...")
        
        try:
            # Load main GAVI + Alerts dataset (historical)
            logger.info(f"Loading GAVI alerts from {settings.GAVI_ALERTS_FILE}")
            self._data_cache['gavi_alerts'] = pd.read_csv(settings.GAVI_ALERTS_FILE)
            
            # Load district stress summary
            logger.info(f"Loading district stress from {settings.DISTRICT_STRESS_FILE}")
            self._data_cache['district_stress'] = pd.read_csv(settings.DISTRICT_STRESS_FILE)
            
            # Load state summary
            logger.info(f"Loading state summary from {settings.STATE_SUMMARY_FILE}")
            self._data_cache['state_summary'] = pd.read_csv(settings.STATE_SUMMARY_FILE)
            
            # Load forecast data
            logger.info(f"Loading forecasts from {settings.FORECAST_FILE}")
            self._data_cache['forecast'] = pd.read_csv(settings.FORECAST_FILE)
            
            # Load critical future alerts
            logger.info(f"Loading critical future alerts from {settings.CRITICAL_FUTURE_FILE}")
            self._data_cache['critical_future'] = pd.read_csv(settings.CRITICAL_FUTURE_FILE)
            
            # Load district future alerts
            logger.info(f"Loading district future alerts from {settings.DISTRICT_FUTURE_FILE}")
            self._data_cache['district_future'] = pd.read_csv(settings.DISTRICT_FUTURE_FILE)
            
            # Load baseline data
            logger.info(f"Loading station baseline from {settings.BASELINE_FILE}")
            self._data_cache['baseline'] = pd.read_csv(settings.BASELINE_FILE)
            
            # Data quality checks
            self._validate_datasets()
            
            logger.info("✅ All datasets loaded successfully!")
            logger.info(f"   - GAVI Alerts: {len(self._data_cache['gavi_alerts']):,} records")
            logger.info(f"   - Districts: {len(self._data_cache['district_stress']):,} districts")
            logger.info(f"   - States: {len(self._data_cache['state_summary']):,} states")
            logger.info(f"   - Forecast: {len(self._data_cache['forecast']):,} stations")
            
        except FileNotFoundError as e:
            logger.error(f"❌ Data file not found: {e}")
            raise DataLoadingError(f"Required data file not found: {e}")
        except Exception as e:
            logger.error(f"❌ Error loading datasets: {e}")
            raise DataLoadingError(f"Failed to load datasets: {e}")
    
    def _validate_datasets(self):
        """Basic validation of loaded datasets"""
        required_cols = {
            'gavi_alerts': ['station_id', 'GAVI', 'ALERT_CONFIRMED', 'year'],
            'district_stress': ['STATE_UT', 'DISTRICT', 'stressed_ratio'],
            'state_summary': ['STATE_UT', 'total_stations'],
            'forecast': ['station_id', 'GAVI_forecast_1y', 'FUTURE_ALERT_1y']
        }
        
        for dataset_name, cols in required_cols.items():
            df = self._data_cache.get(dataset_name)
            if df is None:
                raise DataLoadingError(f"Dataset '{dataset_name}' not loaded")
            
            missing_cols = set(cols) - set(df.columns)
            if missing_cols:
                raise DataLoadingError(
                    f"Dataset '{dataset_name}' missing columns: {missing_cols}"
                )
    
    def get_gavi_alerts(self, 
                       year: Optional[int] = None,
                       state: Optional[str] = None) -> pd.DataFrame:
        """Get GAVI alerts dataset with optional filters"""
        df = self._data_cache['gavi_alerts'].copy()
        
        if year is not None:
            df = df[df['year'] == year]
        
        if state is not None:
            df = df[df['STATE_UT'] == state]
        
        return df
    
    def get_latest_year_data(self) -> pd.DataFrame:
        """Get most recent year's data per station"""
        df = self._data_cache['gavi_alerts']
        latest_year = df['year'].max()
        return df[df['year'] == latest_year].copy()
    
    def get_district_stress(self) -> pd.DataFrame:
        """Get district stress summary"""
        return self._data_cache['district_stress'].copy()
    
    def get_state_summary(self) -> pd.DataFrame:
        """Get state-level summary"""
        return self._data_cache['state_summary'].copy()
    
    def get_forecast(self, station_id: Optional[str] = None) -> pd.DataFrame:
        """Get forecast data"""
        df = self._data_cache['forecast'].copy()
        
        if station_id is not None:
            df = df[df['station_id'] == station_id]
        
        return df
    
    def get_critical_future(self) -> pd.DataFrame:
        """Get critical future alerts"""
        return self._data_cache['critical_future'].copy()
    
    def get_district_future(self) -> pd.DataFrame:
        """Get district future alerts"""
        return self._data_cache['district_future'].copy()
    
    def get_baseline(self) -> pd.DataFrame:
        """Get station baseline data"""
        return self._data_cache['baseline'].copy()
    
    def get_station_timeseries(self, station_id: str) -> Optional[pd.DataFrame]:
        """Get complete time series for a single station"""
        df = self._data_cache['gavi_alerts']
        station_data = df[df['station_id'] == station_id].copy()
        
        if len(station_data) == 0:
            return None
        
        return station_data.sort_values('year')
    
    def list_states(self) -> list:
        """Get list of all states"""
        return sorted(self._data_cache['gavi_alerts']['STATE_UT'].unique().tolist())
    
    def list_districts(self, state: Optional[str] = None) -> list:
        """Get list of districts, optionally filtered by state"""
        df = self._data_cache['gavi_alerts']
        
        if state is not None:
            df = df[df['STATE_UT'] == state]
        
        return sorted(df['DISTRICT'].unique().tolist())
    
    def get_latest_year(self) -> int:
        """Get the most recent year in the dataset"""
        return int(self._data_cache['gavi_alerts']['year'].max())


# Global singleton instance
data_service = DataService()


@lru_cache(maxsize=128)
def get_data_service() -> DataService:
    """
    Dependency injection function for FastAPI endpoints.
    Returns cached singleton instance.
    """
    return data_service
