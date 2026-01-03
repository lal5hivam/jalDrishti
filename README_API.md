# 🌊 JalDrishti Groundwater Intelligence API

**Production-ready backend for CGWB groundwater monitoring and forecasting**

A FastAPI-based REST API that exposes groundwater intelligence derived from CGWB's DWLR monitoring network (2015-2024). Built for policy dashboards, mobile apps, and geospatial visualization platforms.

---

## 🎯 **What This API Does**

### Key Capabilities

1. **Station-Normalized GAVI Scoring**
   - Groundwater Availability Index (GAVI) computed per station
   - Normalized against each well's historical baseline (min/max WL)
   - 4-tier classification: Safe (75+) | Watch (50-75) | Stressed (25-50) | Critical (<25)

2. **Multi-Layered Alert System**
   - 🔴 **CRITICAL_GROUNDWATER**: GAVI < 25
   - 🟠 **DEPLETION_WARNING**: GAVI < 50 AND declining
   - 🟡 **SUDDEN_DROP**: Sharp decline (≤ -2m year-over-year)
   - 🟢 **RECOVERY_SIGNAL**: Significant recharge (≥ +1m)

3. **Predictive Forecasting**
   - Trend-based predictions (1-year and 3-year horizons)
   - Future GAVI scores and alert classifications
   - Early warning system for proactive intervention

4. **Policy-Ready Aggregations**
   - District and state-level stress rankings
   - Top critical districts requiring intervention
   - Downloadable CSV reports for offline analysis

---

## 🚀 **Quick Start**

### Prerequisites

- Python 3.9+
- Precomputed CSV datasets in `output/` directory

### Installation

```bash
# 1. Clone or navigate to project directory
cd tabula

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt
```

### Run the Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use Python directly
python -m app.main
```

The API will be available at:
- **Interactive docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc
- **Root endpoint**: http://localhost:8000/

---

## 📡 **API Endpoints**

### 1️⃣ **Summary Endpoints**

#### GET `/api/summary/national`
National groundwater health overview.

**Example Response:**
```json
{
  "total_stations": 9547,
  "stressed_percentage": 45.2,
  "average_gavi": 52.3,
  "active_critical_alerts": 234,
  "year": 2024
}
```

**Use Case:** Executive dashboard header, national policy briefing

---

#### GET `/api/summary/districts`
District-level stress rankings with filters.

**Query Parameters:**
- `state` (optional): Filter by state
- `min_stressed_ratio` (optional): Minimum stress threshold
- `sort_by` (default: `stressed_ratio`): Sort field
- `limit` (optional): Limit results

**Example Response:**
```json
[
  {
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
]
```

**Use Case:** District prioritization map, resource allocation planning

---

#### GET `/api/summary/states`
State-level aggregated metrics.

**Example Response:**
```json
[
  {
    "state": "Gujarat",
    "total_stations": 456,
    "stressed_percentage": 52.3,
    "avg_gavi": 48.7,
    "critical_alerts": 45,
    "depletion_alerts": 23,
    "recovery_signals": 12
  }
]
```

**Use Case:** State comparison dashboard

---

### 2️⃣ **Station Endpoints**

#### GET `/api/stations/alerts`
Station-level alert data for map visualization.

**Query Parameters:**
- `state` (optional): Filter by state
- `district` (optional): Filter by district
- `alert_type` (optional): Filter by alert type
- `year` (optional): Year (defaults to latest)
- `limit` (default: 500): Maximum results

**Example Response:**
```json
[
  {
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
]
```

**Use Case:** Interactive geospatial map with marker clustering

---

#### GET `/api/stations/{station_id}/timeseries`
Complete time series + forecast for a single station.

**Example Response:**
```json
{
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
```

**Use Case:** Station detail page, trend analysis chart

---

#### GET `/api/stations/list`
List all stations with basic metadata.

**Query Parameters:**
- `state` (optional): Filter by state
- `district` (optional): Filter by district

**Use Case:** Station selection dropdown, autocomplete

---

### 3️⃣ **Alert Endpoints**

#### GET `/api/alerts/critical`
Critical & future alert summary.

**Example Response:**
```json
{
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
```

**Use Case:** Early warning dashboard, emergency planning

---

#### GET `/api/alerts/by-type`
Alert distribution breakdown.

**Query Parameters:**
- `year` (optional): Year (defaults to latest)

**Use Case:** Alert system validation, communication planning

---

#### GET `/api/alerts/future-risk`
Detailed future risk analysis.

**Query Parameters:**
- `horizon` (default: `1y`): `1y` or `3y`

**Use Case:** Long-term planning, budget allocation

---

### 4️⃣ **Report Endpoints**

#### GET `/api/reports/download`
Download CSV reports.

**Query Parameters:**
- `report_type` (required): `district_stress`, `state_summary`, `future_alerts`, `critical_future`, `gavi_alerts`
- `state` (optional): Filter by state (for `gavi_alerts`)

**Example:**
```
GET /api/reports/download?report_type=district_stress
```

**Use Case:** Offline analysis, policy briefings, data sharing

---

#### GET `/api/reports/metadata`
Report availability and metadata.

**Use Case:** Discover available data exports

---

## 📊 **Data Schema**

### Key Concepts

| Term | Definition |
|------|------------|
| **GAVI** | Groundwater Availability Index - normalized 0-100 score per station |
| **WL_MBGL** | Water Level in Meters Below Ground Level |
| **delta_wl** | Year-over-year change in water level (negative = depletion) |
| **Stressed** | Station with GAVI < 50 in most recent observation |
| **Baseline** | Historical min/max WL per station (normalization reference) |

---

## 🛠️ **Architecture**

```
app/
├── main.py              # FastAPI app, middleware, startup/shutdown
├── config.py            # Settings, paths, constants
├── models/
│   ├── __init__.py
│   └── schemas.py       # Pydantic response models
├── services/
│   ├── __init__.py
│   └── data_loader.py   # CSV loading, caching, data access
└── routers/
    ├── __init__.py
    ├── summary.py       # National/district/state summaries
    ├── stations.py      # Station-level data & time series
    ├── alerts.py        # Alert summaries & future risk
    └── reports.py       # CSV downloads
```

### Design Principles

1. **No Runtime Computation**: All analytics precomputed offline
2. **Singleton Data Service**: Datasets loaded once at startup, cached in memory
3. **Read-Only APIs**: No authentication, no write operations
4. **Frontend-Friendly**: Clean JSON responses, Pydantic validation
5. **Policy Language**: Responses use decision-oriented terminology

---

## 🔧 **Configuration**

Edit `app/config.py` to customize:

- `DATA_DIR`: Path to CSV datasets (default: `output/`)
- `LATEST_YEAR`: Most recent data year (default: 2024)
- `ALLOWED_ORIGINS`: CORS configuration for frontend
- `DEFAULT_PAGE_SIZE`: Default pagination limit

---

## 🧪 **Testing**

### Manual Testing

```bash
# National summary
curl http://localhost:8000/api/summary/national

# District stress (top 10 critical)
curl "http://localhost:8000/api/summary/districts?sort_by=stressed_ratio&limit=10"

# Station alerts for Gujarat
curl "http://localhost:8000/api/stations/alerts?state=Gujarat&limit=100"

# Critical alert summary
curl http://localhost:8000/api/alerts/critical

# Download district stress report
curl "http://localhost:8000/api/reports/download?report_type=district_stress" -o district_stress.csv
```

### Interactive Testing

Visit http://localhost:8000/docs for Swagger UI with:
- Try-it-out functionality
- Request/response examples
- Model schemas

---

## 📦 **Production Deployment**

### Using Gunicorn (Linux/macOS)

```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY output/ ./output/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🎨 **Frontend Integration Examples**

### React/Next.js

```javascript
// Fetch national summary
const response = await fetch('http://localhost:8000/api/summary/national');
const data = await response.json();

console.log(`National GAVI: ${data.average_gavi}`);
console.log(`Stressed: ${data.stressed_percentage}%`);
```

### Leaflet Map

```javascript
// Load station alerts for map markers
fetch('http://localhost:8000/api/stations/alerts?limit=1000')
  .then(res => res.json())
  .then(stations => {
    stations.forEach(station => {
      const color = station.severity === 'CRITICAL' ? 'red' : 'orange';
      L.circleMarker([station.latitude, station.longitude], {
        color: color,
        radius: 5
      }).addTo(map);
    });
  });
```

---

## 🏆 **Innovation Highlights**

### This API Is Different Because:

1. **Anticipation, Not Just Detection**
   - Forecast-based early warnings
   - Proactive policy intervention support
   - "Act BEFORE crisis hits" philosophy

2. **Station-Normalized Intelligence**
   - GAVI accounts for each well's unique baseline
   - Fair comparison across diverse geology
   - Not just absolute water levels

3. **Multi-Layered Alerting**
   - 4 alert types capture different failure modes
   - Persistence checks reduce false alarms
   - Recovery signals validate recharge success

4. **Policy-Ready Outputs**
   - District rankings for resource allocation
   - Downloadable reports for briefings
   - Clear action recommendations per alert

---

## 📝 **API Response Standards**

### Success Response

```json
{
  "field1": "value",
  "field2": 123
}
```

### Error Response

```json
{
  "error": "Not Found",
  "message": "Station 'XYZ' not found",
  "details": "Additional context..."
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `404 Not Found`: Resource not found
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

---

## 🤝 **Contributing**

This API is designed for **read-only access** to precomputed groundwater intelligence. 

To add new features:
1. Generate new analytics in Jupyter notebooks
2. Export to CSV in `output/` directory
3. Add new endpoint in appropriate router
4. Update this README

---

## 📄 **License**

Data Source: **Central Ground Water Board (CGWB), India**  
API Implementation: Custom backend for JalDrishti project

---

## 🆘 **Support**

### Common Issues

**Q: "Data files not found" error on startup**  
A: Ensure `output/` directory exists with all CSV files from Jupyter notebook execution.

**Q: API is slow**  
A: All data is cached in memory at startup. First request may be slower; subsequent requests are fast.

**Q: CORS errors in browser**  
A: Update `ALLOWED_ORIGINS` in `app/config.py` to include your frontend domain.

---

## 🎯 **Roadmap**

Future enhancements (not yet implemented):
- [ ] WebSocket support for real-time updates
- [ ] PostgreSQL/SQLite backend option
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] API key authentication (if needed)
- [ ] GraphQL endpoint
- [ ] Mobile-optimized responses

---

**Built with:** FastAPI 🚀 | **Data:** CGWB WRIS | **Version:** 1.0.0

**Project:** JalDrishti - Groundwater Intelligence for India 🇮🇳

---

## 📞 **Quick Reference**

```bash
# Start server
uvicorn app.main:app --reload

# View docs
open http://localhost:8000/docs

# Test endpoint
curl http://localhost:8000/api/summary/national

# Download report
curl "http://localhost:8000/api/reports/download?report_type=district_stress" -o report.csv
```

**Happy Monitoring! 🌊💧**
