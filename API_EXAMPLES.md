# 🎯 JalDrishti API - Example Responses

Complete examples of API responses for all endpoints.

---

## 1. Root Endpoint

**Request:**
```bash
GET http://localhost:8000/
```

**Response:**
```json
{
  "api_name": "JalDrishti Groundwater Intelligence API",
  "version": "1.0.0",
  "description": "Groundwater monitoring intelligence with GAVI-based alerts and forecasting",
  "endpoints": [
    {
      "path": "/api/summary/national",
      "method": "GET",
      "description": "National groundwater health summary"
    },
    {
      "path": "/api/summary/districts",
      "method": "GET",
      "description": "District-level stress rankings"
    }
    // ... more endpoints
  ]
}
```

---

## 2. National Summary

**Request:**
```bash
GET /api/summary/national?year=2024
```

**Response:**
```json
{
  "total_stations": 9547,
  "stressed_percentage": 45.23,
  "average_gavi": 52.34,
  "active_critical_alerts": 234,
  "year": 2024
}
```

**Use Case:** Display on national dashboard header

---

## 3. District Summary

**Request:**
```bash
GET /api/summary/districts?sort_by=stressed_ratio&limit=3
```

**Response:**
```json
[
  {
    "state": "West Bengal",
    "district": "Uttar Dinajpur",
    "stressed_ratio": 100.0,
    "avg_gavi": 47.29,
    "critical_alerts": 9,
    "depletion_alerts": 5,
    "total_stations": 7,
    "stress_category": "Critical",
    "future_risk_flag": "HIGH"
  },
  {
    "state": "Andhra Pradesh",
    "district": "Alluri Sitharama Raju",
    "stressed_ratio": 100.0,
    "avg_gavi": 52.15,
    "critical_alerts": 14,
    "depletion_alerts": 8,
    "total_stations": 11,
    "stress_category": "Critical",
    "future_risk_flag": "HIGH"
  },
  {
    "state": "Andhra Pradesh",
    "district": "Anakapalli",
    "stressed_ratio": 100.0,
    "avg_gavi": 48.80,
    "critical_alerts": 4,
    "depletion_alerts": 8,
    "total_stations": 7,
    "stress_category": "Critical",
    "future_risk_flag": "MEDIUM"
  }
]
```

**Use Case:** District ranking table, prioritization map

---

## 4. State Summary

**Request:**
```bash
GET /api/summary/states
```

**Response:**
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
  },
  {
    "state": "Maharashtra",
    "total_stations": 823,
    "stressed_percentage": 48.2,
    "avg_gavi": 51.4,
    "critical_alerts": 67,
    "depletion_alerts": 34,
    "recovery_signals": 8
  }
]
```

---

## 5. Station Alerts

**Request:**
```bash
GET /api/stations/alerts?state=Gujarat&alert_type=CRITICAL_GROUNDWATER&limit=2
```

**Response:**
```json
[
  {
    "station_id": "Gujarat_22.4208_73.4194",
    "latitude": 22.4208,
    "longitude": 73.4194,
    "state": "Gujarat",
    "district": "Vadodara",
    "gavi": 23.45,
    "gavi_category": "Critical",
    "alert": "CRITICAL_GROUNDWATER",
    "severity": "CRITICAL",
    "wl_mbgl": 18.52,
    "delta_wl": -2.34,
    "year": 2024
  },
  {
    "station_id": "Gujarat_21.5622_72.9289",
    "latitude": 21.5622,
    "longitude": 72.9289,
    "state": "Gujarat",
    "district": "Surat",
    "gavi": 21.87,
    "gavi_category": "Critical",
    "alert": "CRITICAL_GROUNDWATER",
    "severity": "CRITICAL",
    "wl_mbgl": 24.31,
    "delta_wl": -1.89,
    "year": 2024
  }
]
```

**Use Case:** Map markers with color coding

---

## 6. Station Time Series

**Request:**
```bash
GET /api/stations/Gujarat_22.4208_73.4194/timeseries
```

**Response:**
```json
{
  "station_id": "Gujarat_22.4208_73.4194",
  "state": "Gujarat",
  "district": "Vadodara",
  "latitude": 22.4208,
  "longitude": 73.4194,
  "historical": [
    {
      "year": 2015,
      "wl_mbgl": 12.34,
      "gavi": 65.23,
      "alert": "NORMAL",
      "delta_wl": null
    },
    {
      "year": 2016,
      "wl_mbgl": 14.12,
      "gavi": 58.47,
      "alert": "DEPLETION_WARNING",
      "delta_wl": 1.78
    },
    {
      "year": 2017,
      "wl_mbgl": 15.89,
      "gavi": 51.23,
      "alert": "DEPLETION_WARNING",
      "delta_wl": 1.77
    },
    {
      "year": 2024,
      "wl_mbgl": 18.52,
      "gavi": 23.45,
      "alert": "CRITICAL_GROUNDWATER",
      "delta_wl": -2.34
    }
  ],
  "current_gavi": 23.45,
  "current_alert": "CRITICAL_GROUNDWATER",
  "current_year": 2024,
  "forecast_1y": {
    "year": 2025,
    "wl": 19.87,
    "gavi": 18.92
  },
  "forecast_3y": {
    "year": 2027,
    "wl": 22.45,
    "gavi": 12.34
  },
  "future_alert_1y": "FUTURE_CRITICAL",
  "future_alert_3y": "FUTURE_CRITICAL",
  "min_wl": 8.5,
  "max_wl": 24.2
}
```

**Use Case:** Station detail page with chart (historical + forecast overlay)

---

## 7. Critical Alerts Summary

**Request:**
```bash
GET /api/alerts/critical
```

**Response:**
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
      "stressed_ratio": 68.5,
      "avg_gavi": 41.2
    },
    {
      "state": "Maharashtra",
      "district": "Nanded",
      "current_critical": 10,
      "future_critical_1y": 7,
      "stressed_ratio": 65.3,
      "avg_gavi": 43.8
    },
    {
      "state": "Gujarat",
      "district": "Vadodara",
      "current_critical": 9,
      "future_critical_1y": 6,
      "stressed_ratio": 62.1,
      "avg_gavi": 45.2
    }
  ]
}
```

**Use Case:** Early warning dashboard, emergency planning report

---

## 8. Alerts by Type

**Request:**
```bash
GET /api/alerts/by-type?year=2024
```

**Response:**
```json
{
  "year": 2024,
  "total_stations": 9547,
  "alert_distribution": {
    "NORMAL": {
      "count": 5234,
      "percentage": 54.82
    },
    "CRITICAL_GROUNDWATER": {
      "count": 234,
      "percentage": 2.45
    },
    "DEPLETION_WARNING": {
      "count": 2156,
      "percentage": 22.58
    },
    "SUDDEN_DROP": {
      "count": 1823,
      "percentage": 19.09
    },
    "RECOVERY_SIGNAL": {
      "count": 100,
      "percentage": 1.05
    }
  }
}
```

**Use Case:** Pie chart, alert system validation

---

## 9. Future Risk Analysis

**Request:**
```bash
GET /api/alerts/future-risk?horizon=1y
```

**Response:**
```json
{
  "horizon": "1y",
  "total_stations": 9547,
  "future_alert_distribution": {
    "FUTURE_CRITICAL": {
      "count": 187,
      "percentage": 1.96
    },
    "EARLY_DEPLETION_WARNING": {
      "count": 1234,
      "percentage": 12.93
    },
    "RECOVERY_EXPECTED": {
      "count": 456,
      "percentage": 4.78
    },
    "STABLE": {
      "count": 7670,
      "percentage": 80.33
    }
  },
  "top_10_states_at_risk": {
    "Gujarat": 23,
    "Maharashtra": 19,
    "Rajasthan": 17,
    "Uttar Pradesh": 15,
    "Tamil Nadu": 12
  }
}
```

**Use Case:** Long-term planning dashboard

---

## 10. Station List

**Request:**
```bash
GET /api/stations/list?state=Gujarat&district=Vadodara
```

**Response:**
```json
{
  "total_stations": 34,
  "stations": [
    {
      "station_id": "Gujarat_22.4208_73.4194",
      "STATE_UT": "Gujarat",
      "DISTRICT": "Vadodara",
      "LATITUDE": 22.4208,
      "LONGITUDE": 73.4194
    },
    {
      "station_id": "Gujarat_22.3872_73.1812",
      "STATE_UT": "Gujarat",
      "DISTRICT": "Vadodara",
      "LATITUDE": 22.3872,
      "LONGITUDE": 73.1812
    }
  ]
}
```

**Use Case:** Dropdown, autocomplete

---

## 11. Report Metadata

**Request:**
```bash
GET /api/reports/metadata
```

**Response:**
```json
{
  "available_reports": [
    {
      "report_type": "district_stress",
      "description": "District-level stress metrics with rankings",
      "row_count": 733,
      "columns": [
        "STATE_UT",
        "DISTRICT",
        "total_stations",
        "stressed_ratio",
        "avg_gavi",
        "critical_alerts",
        "depletion_alerts"
      ]
    },
    {
      "report_type": "state_summary",
      "description": "State-level aggregated statistics",
      "row_count": 36,
      "columns": [
        "STATE_UT",
        "total_stations",
        "avg_gavi",
        "critical_count",
        "depletion_count",
        "recovery_count",
        "stressed_pct"
      ]
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
```

---

## 12. Download Report

**Request:**
```bash
GET /api/reports/download?report_type=district_stress
```

**Response:**
CSV file download with headers:
```csv
STATE_UT,DISTRICT,total_stations,total_records,critical_alerts,depletion_alerts,avg_gavi,stressed_ratio
West Bengal,Uttar Dinajpur,7,60,9,5,47.287342287342284,100.0
Andhra Pradesh,Alluri Sitharama Raju,11,109,14,8,52.14799067141207,100.0
```

**Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=district_stress_summary.csv
```

---

## Error Responses

### 404 Not Found

**Request:**
```bash
GET /api/stations/INVALID_STATION_ID/timeseries
```

**Response:**
```json
{
  "detail": "Station 'INVALID_STATION_ID' not found"
}
```

### 400 Bad Request

**Request:**
```bash
GET /api/reports/download?report_type=invalid_type
```

**Response:**
```json
{
  "detail": "Invalid report_type: invalid_type. Must be one of: district_stress, state_summary, future_alerts, critical_future, gavi_alerts"
}
```

### 500 Internal Server Error

**Response:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please contact support.",
  "details": null
}
```

---

## Response Headers

All successful responses include:

```
Content-Type: application/json
X-Process-Time: 0.0234  # Request duration in seconds
```

---

## Query Parameter Examples

### Filtering

```bash
# Filter by state
GET /api/stations/alerts?state=Gujarat

# Filter by multiple criteria
GET /api/summary/districts?state=Gujarat&min_stressed_ratio=50

# Filter and sort
GET /api/summary/districts?state=Maharashtra&sort_by=avg_gavi&limit=10
```

### Pagination

```bash
# Limit results
GET /api/stations/alerts?limit=100

# Top 20 critical districts
GET /api/summary/districts?sort_by=critical_alerts&limit=20
```

---

**Note:** All numeric values are rounded to 2 decimal places for frontend consumption.

**Date Format:** All years are integers (2024, 2025, etc.)

**Null Handling:** Missing values are returned as `null` in JSON responses.
