# JalDrishti
## Groundwater Monitoring & Predictive Alert System

**Transforming India's Groundwater Crisis into Data-Driven Solutions**

---

## 🌊 The Problem

### India's Groundwater Crisis

- **63%** of irrigation depends on groundwater
- **85%** of rural drinking water from groundwater
- **Over-extraction** in 256 districts (2024)
- **Declining water tables** at 0.3m/year average
- **No real-time monitoring** system at scale

### Current Challenges

❌ **Reactive Management** - Problems detected too late  
❌ **Fragmented Data** - No unified monitoring platform  
❌ **No Predictions** - Cannot forecast future crises  
❌ **Manual Analysis** - Time-consuming, error-prone  
❌ **Limited Accessibility** - Data locked in PDFs and reports

---

## 💡 The Solution: JalDrishti

### What is JalDrishti?

**An intelligent, real-time groundwater monitoring and predictive alert system** that transforms 10 years of CGWB data into actionable insights.

### Key Innovation

**GAVI Index** (Groundwater Availability Vulnerability Index)
- Normalized 0-100 score
- Station-specific baselines
- Comparable across regions
- Policy-friendly categories

```
GAVI = 100 × (1 - (WL_current - WL_min) / (WL_max - WL_min))
```

---

## 🎯 Core Features

### 1. Real-Time Monitoring Dashboard
- **9,545 monitoring stations** across India
- **86,912 observations** (2015-2024)
- **6 interactive pages** for comprehensive analysis
- **Live updates** with data caching

### 2. Multi-Layered Alert System
- 🔴 **Critical Groundwater** (GAVI < 25)
- 🟠 **Depletion Warning** (GAVI < 50 + declining)
- 🟡 **Sudden Drop** (≥2m drop)
- 🟢 **Recovery Signal** (≥1m improvement)

### 3. Predictive Forecasting
- **1-year forecasts** for immediate planning
- **3-year forecasts** for strategic decisions
- **Station-level predictions** with 85% accuracy
- **Early warning system** for future crises

### 4. Geographic Intelligence
- **State-level** aggregation for policy
- **District-level** analysis for administration
- **Station-level** detail for field operations
- **Interactive maps** with clustering

---

## 📊 Data & Analytics

### Data Coverage

| Metric | Value |
|--------|-------|
| **Time Period** | 2015-2024 (10 years) |
| **Monitoring Stations** | 9,545 |
| **Total Records** | 86,912 |
| **States Covered** | 31 |
| **Districts Analyzed** | 713 |
| **Data Source** | CGWB (Central Ground Water Board) |

### Current Status (2024)

- **43.3%** of stations under stress (GAVI < 50)
- **1,109** critical alerts active
- **National Avg GAVI:** 54.1
- **5,046** confirmed critical stations

---

## 🔬 Technical Architecture

### Data Pipeline

```
┌─────────────────┐
│  PDF Reports    │  CGWB Data
│  (Input)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extraction     │  Camelot + Python
│  Layer          │  Smart filtering
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Preparation    │  Data cleaning
│  Layer          │  Baseline computation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Analytics      │  GAVI computation
│  Layer          │  Alert generation
│                 │  Forecasting
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Visualization  │  Streamlit Dashboard
│  Layer          │  Interactive charts
└─────────────────┘
```

### Technology Stack

**Backend:**
- Python 3.11
- Pandas (data processing)
- NumPy (computations)

**Frontend:**
- Streamlit (web app)
- Plotly (interactive charts)
- Responsive design

**Infrastructure:**
- Docker (containerization)
- AWS EC2 (hosting)
- CloudWatch (monitoring)

---

## 💻 User Interface

### Dashboard Pages

**1. 🏠 