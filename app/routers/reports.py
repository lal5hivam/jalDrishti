"""
Report download endpoints - CSV exports for offline analysis and policy reporting.
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
import io

from ..services import DataService, get_data_service

router = APIRouter(prefix="/api/reports", tags=["Reports & Downloads"])


@router.get("/download")
async def download_report(
    report_type: str = Query(
        ..., 
        description="Report type: district_stress, state_summary, future_alerts, critical_future, gavi_alerts"
    ),
    state: Optional[str] = Query(None, description="Filter by state (applicable to some reports)"),
    data_service: DataService = Depends(get_data_service)
):
    """
    ## Download Reports as CSV
    
    Exports precomputed datasets for offline analysis, presentations, and policy reports.
    
    **Available Reports:**
    - **district_stress**: District-level stress metrics with future risk flags
    - **state_summary**: State-level aggregated statistics
    - **future_alerts**: Predicted critical stations (1y and 3y horizons)
    - **critical_future**: Stations requiring immediate attention
    - **gavi_alerts**: Complete historical GAVI + alerts dataset
    
    **Use Case:** Offline analysis, policy briefings, presentations, data sharing
    
    **Decision Support:** "Give me the data for my analysis/report."
    """
    
    # Load appropriate dataset
    if report_type == "district_stress":
        df = data_service.get_district_stress()
        filename = "district_stress_summary.csv"
        
    elif report_type == "state_summary":
        df = data_service.get_state_summary()
        filename = "state_summary.csv"
        
    elif report_type == "future_alerts":
        df = data_service.get_district_future()
        filename = "district_future_alerts.csv"
        
    elif report_type == "critical_future":
        df = data_service.get_critical_future()
        filename = "critical_future_alerts.csv"
        
    elif report_type == "gavi_alerts":
        # This is the large dataset - optionally filter by state
        df = data_service.get_gavi_alerts(state=state)
        filename = f"gavi_alerts_{state if state else 'all'}.csv"
        
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid report_type: {report_type}. Must be one of: district_stress, state_summary, future_alerts, critical_future, gavi_alerts"
        )
    
    # Convert DataFrame to CSV in memory
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)
    
    # Return as downloadable file
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/metadata")
async def get_report_metadata(
    data_service: DataService = Depends(get_data_service)
):
    """
    ## Report Metadata
    
    Returns information about available reports and their contents.
    
    **Use Case:** Discover available data exports
    """
    
    return {
        "available_reports": [
            {
                "report_type": "district_stress",
                "description": "District-level stress metrics with rankings",
                "row_count": len(data_service.get_district_stress()),
                "columns": list(data_service.get_district_stress().columns)
            },
            {
                "report_type": "state_summary",
                "description": "State-level aggregated statistics",
                "row_count": len(data_service.get_state_summary()),
                "columns": list(data_service.get_state_summary().columns)
            },
            {
                "report_type": "future_alerts",
                "description": "District-level future risk predictions",
                "row_count": len(data_service.get_district_future()),
                "columns": list(data_service.get_district_future().columns)
            },
            {
                "report_type": "critical_future",
                "description": "Stations predicted to become critical",
                "row_count": len(data_service.get_critical_future()),
                "columns": list(data_service.get_critical_future().columns)
            },
            {
                "report_type": "gavi_alerts",
                "description": "Complete historical GAVI + alerts dataset (2015-2024)",
                "row_count": "~86,000 (filterable by state)",
                "columns": "station_id, GAVI, ALERT_CONFIRMED, year, WL_MBGL, etc."
            }
        ],
        "usage": "Use GET /api/reports/download?report_type=<type> to download"
    }
