"""
JalDrishti Groundwater Intelligence API
Main application entry point
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from .config import settings
from .routers import summary_router, stations_router, alerts_router, reports_router
from .services import data_service
from .models import APIInfo

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Middleware for request logging and timing
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with timing"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Log request
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {duration:.3f}s"
    )
    
    # Add timing header
    response.headers["X-Process-Time"] = str(duration)
    
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully"""
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please contact support.",
            "details": str(exc) if settings.API_VERSION != "production" else None
        }
    )


# Startup event - load data
@app.on_event("startup")
async def startup_event():
    """Initialize data service at startup"""
    logger.info("🚀 Starting JalDrishti API...")
    logger.info("📂 Loading datasets...")
    
    try:
        # Data service is initialized automatically via singleton pattern
        # This just ensures it's loaded before any requests
        _ = data_service
        logger.info("✅ API ready to serve requests!")
        logger.info(f"📊 Latest data year: {data_service.get_latest_year()}")
        logger.info(f"📍 Total stations: {data_service.get_latest_year_data()['station_id'].nunique()}")
        logger.info(f"🗺️ States covered: {len(data_service.list_states())}")
    except Exception as e:
        logger.error(f"❌ Failed to load datasets: {e}")
        raise


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down JalDrishti API...")


# Root endpoint - API information
@app.get("/", response_model=APIInfo, tags=["Root"])
async def root():
    """
    ## JalDrishti Groundwater Intelligence API
    
    Welcome to the **JalDrishti API** - a production-ready backend for CGWB groundwater monitoring intelligence.
    
    ### 🎯 What This API Provides
    
    1. **National & Regional Summaries**
       - National groundwater health metrics
       - State and district-level stress rankings
       - Policy-ready aggregations
    
    2. **Station-Level Intelligence**
       - Individual well monitoring data
       - Alert status for each station
       - Complete time series with forecasts
    
    3. **Early Warning System**
       - Current critical alerts
       - Predicted future critical conditions (1y & 3y)
       - District-level risk assessment
    
    4. **Data Exports**
       - Downloadable CSV reports
       - Offline analysis support
       - Policy briefing materials
    
    ### 📊 Data Coverage
    - **Timeline**: 2015-2024 (Annual observations)
    - **Stations**: ~10,000 CGWB monitoring wells
    - **States**: Pan-India coverage
    - **Methodology**: Station-normalized GAVI + multi-layered alerts
    
    ### 🚀 Quick Start
    - **Interactive Docs**: [/docs](/docs) (Swagger UI)
    - **Alternative Docs**: [/redoc](/redoc) (ReDoc)
    
    ### 💡 Innovation
    This system provides **anticipation, not just detection** - early warning intelligence 
    for policy makers to act BEFORE groundwater crisis hits.
    
    ---
    
    **Built with:** FastAPI + Pandas | **Data:** CGWB WRIS | **Version:** 1.0.0
    """
    
    endpoints = [
        {
            "path": "/api/summary/national",
            "method": "GET",
            "description": "National groundwater health summary"
        },
        {
            "path": "/api/summary/districts",
            "method": "GET",
            "description": "District-level stress rankings"
        },
        {
            "path": "/api/summary/states",
            "method": "GET",
            "description": "State-level aggregated metrics"
        },
        {
            "path": "/api/stations/alerts",
            "method": "GET",
            "description": "Station alert map data (with filters)"
        },
        {
            "path": "/api/stations/{station_id}/timeseries",
            "method": "GET",
            "description": "Station time series + forecast"
        },
        {
            "path": "/api/stations/list",
            "method": "GET",
            "description": "List all stations with metadata"
        },
        {
            "path": "/api/alerts/critical",
            "method": "GET",
            "description": "Critical & future alert summary"
        },
        {
            "path": "/api/alerts/by-type",
            "method": "GET",
            "description": "Alert distribution by type"
        },
        {
            "path": "/api/alerts/future-risk",
            "method": "GET",
            "description": "Future risk analysis"
        },
        {
            "path": "/api/reports/download",
            "method": "GET",
            "description": "Download CSV reports"
        },
        {
            "path": "/api/reports/metadata",
            "method": "GET",
            "description": "Report metadata and availability"
        }
    ]
    
    return APIInfo(
        api_name=settings.API_TITLE,
        version=settings.API_VERSION,
        description="Groundwater monitoring intelligence with GAVI-based alerts and forecasting",
        endpoints=endpoints
    )


# Health check endpoint
@app.get("/health", tags=["Root"])
async def health_check():
    """
    ## Health Check
    
    Returns API health status and basic metrics.
    """
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
        "data_loaded": data_service._loaded,
        "latest_year": data_service.get_latest_year(),
        "total_stations": data_service.get_latest_year_data()['station_id'].nunique()
    }


# Include routers
app.include_router(summary_router)
app.include_router(stations_router)
app.include_router(alerts_router)
app.include_router(reports_router)


# Development server runner
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
