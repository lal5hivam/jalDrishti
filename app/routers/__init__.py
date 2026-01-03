"""
Routers package initialization
"""

from .summary import router as summary_router
from .stations import router as stations_router
from .alerts import router as alerts_router
from .reports import router as reports_router

__all__ = ["summary_router", "stations_router", "alerts_router", "reports_router"]
