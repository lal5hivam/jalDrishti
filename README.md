# 🌊 JalDrishti - Groundwater Intelligence Platform

> **India's First Full-Stack Predictive Groundwater Monitoring System**

[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python)](https://www.python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Quick Start](#-quick-start)
6. [API Reference](#-api-reference)
7. [Frontend Pages](#-frontend-pages)
8. [Data Pipeline](#-data-pipeline)
9. [GAVI Index](#-gavi-index)
10. [Alert System](#-alert-system)
11. [Data Files](#-data-files)
12. [Deployment](#-deployment)
13. [Contributing](#-contributing)

---

## 🎯 Overview

**JalDrishti** is a comprehensive groundwater monitoring and predictive alert system built for India's Central Ground Water Board (CGWB). It transforms raw DWLR (Digital Water Level Recorder) data from ~10,000 monitoring wells into actionable intelligence for policy makers.

### What It Does
- 📊 **Monitors** 9,547 stations across 35 states/UTs
- 📈 **Analyzes** 86,517 GAVI records from 2015-2024
- ⚠️ **Alerts** on critical groundwater depletion
- 🔮 **Predicts** future stress (1-year and 3-year forecasts)
- 📍 **Visualizes** district-wise stress on interactive maps

### Key Innovation
> **"Anticipation, Not Reaction"** - Policy makers can act BEFORE crisis hits with our predictive forecasting system.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🌡️ **GAVI Index** | Station-normalized 0-100 score for groundwater availability |
| 🚨 **Multi-Layer Alerts** | Critical, Depletion, Sudden Drop, Recovery signals |
| 🔮 **Predictive Forecasts** | 1-year and 3-year trend-based predictions |
| 🗺️ **Interactive Maps** | Leaflet-based clustering with 10K+ markers |
| 📊 **District Rankings** | Stress ratios and priority intervention lists |
| 📥 **CSV Exports** | Downloadable reports for offline analysis |
| ⚡ **High Performance** | Precomputed analytics, ~100ms response time |

---

## 🛠️ Technology Stack

### Backend (Python/FastAPI)
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | FastAPI | 0.109.0 |
| Server | Uvicorn | 0.27.0 |
| Validation | Pydantic | 2.5.3 |
| Data Processing | Pandas | 2.1.4 |
| Production | Gunicorn | 21.2.0 |

### Frontend (Next.js/React)
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 14.0.4 |
| UI Framework | React | 18.2.0 |
| Language | TypeScript | 5.3.3 |
| Styling | Tailwind CSS | 3.4.0 |
| Maps | Leaflet + MarkerCluster | 1.9.4 |
| Charts | Recharts | 2.10.3 |
| Data Fetching | TanStack React Query | 5.17.9 |
| HTTP Client | Axios | 1.6.5 |

---

## 📁 Project Structure

```
tabula/
├── 🚀 BACKEND API
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings & paths
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic response models
│   │   ├── services/
│   │   │   └── data_loader.py   # CSV loading & caching
│   │   └── routers/
│   │       ├── summary.py       # National/district/state endpoints
│   │       ├── stations.py      # Station data & time series
│   │       ├── alerts.py        # Alert summaries & future risk
│   │       └── reports.py       # CSV download endpoints
│   ├── requirements.txt         # Python dependencies
│   ├── start_api.bat            # Windows startup script
│   └── start_api.sh             # Linux/macOS startup script
│
├── 🎨 FRONTEND
│   └── frontend/
│       ├── src/
│       │   ├── pages/           # Next.js pages (7 routes)
│       │   │   ├── index.tsx    # National dashboard
│       │   │   ├── districts.tsx # District map & ranking
│       │   │   ├── stations/    # Station explorer
│       │   │   ├── alerts.tsx   # Alert center
│       │   │   ├── forecast.tsx # Future risk analysis
│       │   │   ├── reports.tsx  # Download center
│       │   │   └── about.tsx    # About page
│       │   ├── components/      # Reusable UI components
│       │   │   ├── StationMap.tsx     # Leaflet map
│       │   │   ├── DistrictHeatmap.tsx
│       │   │   ├── GAVIBadge.tsx
│       │   │   ├── AlertBadge.tsx
│       │   │   └── StatCard.tsx
│       │   ├── hooks/
│       │   │   └── useApi.ts    # React Query hooks
│       │   ├── lib/
│       │   │   └── api-client.ts # Axios API client
│       │   └── types/
│       │       └── api.ts       # TypeScript interfaces
│       ├── package.json
│       └── tailwind.config.ts
│
├── 📊 DATA & ANALYSIS
│   ├── dataset_prep.ipynb       # Data cleaning pipeline
│   ├── JalDrishti_final.ipynb   # GAVI computation & alerts
│   ├── master-extract.py        # PDF → CSV extraction
│   └── debug_page1.py           # Debugging utilities
│
├── 📂 OUTPUT (Precomputed Data)
│   ├── groundwater_gavi_alerts_2015_2024.csv  # 86K records
│   ├── district_stress_summary.csv            # 732 districts
│   ├── state_alert_summary.csv                # 35 states
│   ├── groundwater_forecast_gavi_alerts.csv   # 9,546 forecasts
│   ├── critical_future_alerts.csv
│   ├── district_future_alerts.csv
│   └── station_baseline.csv
│
└── 📖 DOCUMENTATION
    ├── README.md (this file)
    ├── QUICK_START.md
    ├── API_EXAMPLES.md
    ├── PROJECT_STRUCTURE.md
    └── DEPLOYMENT_GUIDE.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Python** 3.9+ with pip
- **Node.js** 18.0+ with npm
- **Git** (optional)

### Option 1: Full Stack (Recommended)

```bash
# Windows
start_fullstack.bat

# Linux/macOS
chmod +x start_fullstack.sh && ./start_fullstack.sh
```

This starts both backend (port 8000) and frontend (port 3000).

### Option 2: Manual Setup

#### Backend API

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Dashboard

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

### Verify Installation

| Service | URL | Purpose |
|---------|-----|---------|
| API Docs | http://localhost:8000/docs | Interactive Swagger UI |
| API ReDoc | http://localhost:8000/redoc | Alternative API docs |
| Dashboard | http://localhost:3000 | Main web interface |

---

## 📡 API Reference

### Base URL
```
http://localhost:8000
```

### Endpoints Overview

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| **Summary** | `/api/summary/national` | GET | National groundwater health |
| | `/api/summary/districts` | GET | District stress rankings |
| | `/api/summary/states` | GET | State-level metrics |
| **Stations** | `/api/stations/alerts` | GET | Station alerts for maps |
| | `/api/stations/{id}/timeseries` | GET | Historical + forecast data |
| | `/api/stations/list` | GET | Station listing |
| **Alerts** | `/api/alerts/critical` | GET | Critical alert summary |
| | `/api/alerts/by-type` | GET | Alert type distribution |
| | `/api/alerts/future-risk` | GET | Predictive risk analysis |
| **Reports** | `/api/reports/download` | GET | CSV file downloads |
| | `/api/reports/metadata` | GET | Available reports info |

### Example Requests

```bash
# National Summary
curl http://localhost:8000/api/summary/national

# Top 10 Critical Districts
curl "http://localhost:8000/api/summary/districts?sort_by=stressed_ratio&limit=10"

# Station Alerts for Gujarat
curl "http://localhost:8000/api/stations/alerts?state=Gujarat&limit=100"

# Download District Report
curl -O http://localhost:8000/api/reports/download?report_type=district_stress
```

### Response Example

```json
{
  "total_stations": 9547,
  "stressed_percentage": 45.23,
  "average_gavi": 52.34,
  "active_critical_alerts": 234,
  "year": 2024
}
```

---

## 🎨 Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | **National Dashboard** | Overview stats, key metrics, quick links |
| `/districts` | **District Map** | Interactive map with filters, district table |
| `/stations` | **Station Explorer** | Browse all stations, search & filter |
| `/stations/[id]` | **Station Detail** | Time series charts, forecasts, baseline |
| `/alerts` | **Alert Center** | Critical alerts, depletion warnings, future risk |
| `/forecast` | **Future Risk** | 1y/3y predictions, scenario analysis |
| `/reports` | **Download Center** | CSV exports for offline analysis |
| `/about` | **About** | Project information |

### Key Components

| Component | Purpose |
|-----------|---------|
| `StationMap` | Leaflet map with marker clustering (10K+ points) |
| `DistrictHeatmap` | Color-coded district stress visualization |
| `GAVIBadge` | Visual indicator for GAVI scores |
| `AlertBadge` | Colored badges for alert types |
| `StatCard` | Metric display cards |

---

## 📊 Data Pipeline

```
┌──────────────────┐
│  CGWB PDF Data   │
│  (WRIS Portal)   │
└────────┬─────────┘
         │ master-extract.py
         ▼
┌──────────────────┐
│  Raw CSV Files   │
│  (Input folder)  │
└────────┬─────────┘
         │ dataset_prep.ipynb
         ▼
┌──────────────────┐
│  Clean Dataset   │
│  + Station IDs   │
│  + Baselines     │
└────────┬─────────┘
         │ JalDrishti_final.ipynb
         ▼
┌──────────────────┐
│  GAVI Computed   │
│  + Alerts        │
│  + Forecasts     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Output CSVs     │ ◄── Loaded by API at startup
│  (11 files)      │
└──────────────────┘
```

### Processing Steps

1. **Extraction** - PDF tables → CSV using Camelot
2. **Cleaning** - Remove outliers, validate coordinates
3. **Station ID** - Generate unique `{STATE}_{LAT}_{LON}` identifiers
4. **Baseline** - Compute min/max/mean water levels per station
5. **GAVI** - Calculate normalized availability index
6. **Alerts** - Apply multi-layer alert logic
7. **Aggregation** - Summarize by district/state
8. **Forecasting** - Project 1y and 3y trends

---

## 📈 GAVI Index

### Formula

```
GAVI = 100 × (1 - (WL_current - WL_min) / (WL_max - WL_min))
```

| Variable | Description |
|----------|-------------|
| `WL_current` | Current water level (meters below ground level) |
| `WL_min` | Historical minimum water level |
| `WL_max` | Historical maximum water level |

### Categories

| GAVI Range | Category | Color | Status |
|------------|----------|-------|--------|
| 75-100 | 🟢 Safe | Green | Excellent availability |
| 50-74 | 🟡 Watch | Yellow | Moderate stress |
| 25-49 | 🟠 Stressed | Orange | Significant depletion |
| 0-24 | 🔴 Critical | Red | Severe crisis |

---

## 🚨 Alert System

### Alert Types

| Priority | Alert | Condition | Severity | Action |
|----------|-------|-----------|----------|--------|
| 1 | `CRITICAL_GROUNDWATER` | GAVI < 25 | CRITICAL | Emergency intervention |
| 2 | `DEPLETION_WARNING` | GAVI < 50 AND declining | HIGH | Demand regulation |
| 3 | `SUDDEN_DROP` | delta_wl ≤ -2.0m | MEDIUM | Field verification |
| 4 | `RECOVERY_SIGNAL` | delta_wl ≥ +1.0m | POSITIVE | Validate recharge |
| 5 | `NORMAL` | Default | NORMAL | Regular monitoring |

### Future Alerts (Predicted)

| Alert | Condition |
|-------|-----------|
| `FUTURE_CRITICAL` | Predicted GAVI < 25 |
| `FUTURE_DEPLETION` | Predicted decline + stress |
| `RECOVERY_EXPECTED` | Predicted improvement |
| `STABLE` | No significant change expected |

---

## 📂 Data Files

### Output Directory (`/output`)

| File | Records | Description |
|------|---------|-------------|
| `groundwater_gavi_alerts_2015_2024.csv` | 86,517 | Complete historical GAVI + alerts |
| `district_stress_summary.csv` | 732 | District-level aggregation |
| `state_alert_summary.csv` | 35 | State-level summary |
| `groundwater_forecast_gavi_alerts.csv` | 9,546 | 1y and 3y forecasts |
| `critical_future_alerts.csv` | Variable | Stations needing intervention |
| `district_future_alerts.csv` | 732 | District future risk |
| `station_baseline.csv` | 9,547 | Station normalization data |

### Key Columns (GAVI Alerts)

| Column | Type | Description |
|--------|------|-------------|
| `station_id` | string | Unique station identifier |
| `STATE_UT` | string | State/Union Territory |
| `DISTRICT` | string | District name |
| `LATITUDE`, `LONGITUDE` | float | Coordinates |
| `WL_MBGL` | float | Water level (meters below ground) |
| `GAVI` | float | GAVI score (0-100) |
| `GAVI_CATEGORY` | string | Safe/Watch/Stressed/Critical |
| `ALERT_CONFIRMED` | string | Alert type |
| `ALERT_SEVERITY` | string | CRITICAL/HIGH/MEDIUM/POSITIVE/NORMAL |
| `year` | int | Observation year |

---

## 🚀 Deployment

### Development
```bash
# Backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

### Production (Linux)

```bash
# Backend with Gunicorn
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000

# Frontend
cd frontend && npm run build && npm start
```

### Docker

```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt gunicorn
COPY app/ ./app/
COPY output/ ./output/
EXPOSE 8000
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL for frontend |

---

## 📊 Current Statistics

| Metric | Value |
|--------|-------|
| **Total Stations** | 9,547 |
| **States/UTs Covered** | 35 |
| **Districts Covered** | 732 |
| **Historical Records** | 86,517 |
| **Time Period** | 2015-2024 |
| **Forecast Horizon** | 1 year, 3 years |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for CGWB (Central Ground Water Board), India.

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check [QUICK_START.md](QUICK_START.md) for common problems
- Review [API_EXAMPLES.md](API_EXAMPLES.md) for usage examples

---

<div align="center">

**Built with ❤️ for India's Groundwater Future**

🌊 JalDrishti - *"Anticipation, Not Reaction"*

</div>
