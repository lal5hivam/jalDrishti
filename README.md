    # Groundwater Monitoring & Predictive Alert System (2015-2024)

    ## Project Overview

    This project implements a comprehensive groundwater monitoring and predictive alert system for India using CGWB (Central Ground Water Board) data from 2015-2024. The system combines data engineering, statistical analysis, and machine learning to provide real-time alerts and future forecasts for groundwater availability.

    ---

    ## Table of Contents

    - [Architecture](#architecture)
    - [Services & Capabilities](#services--capabilities)
    - [Data Pipeline](#data-pipeline)
    - [GAVI Index](#gavi-index)
    - [Alert System](#alert-system)
    - [Predictive Forecasting](#predictive-forecasting)
    - [Output Files](#output-files)
    - [Key Metrics](#key-metrics)
    - [Getting Started](#getting-started)
    - [Next Steps](#next-steps)

    ---

    ## Architecture

    ```
    ┌─────────────────┐
    │  PDF Reports    │
    │  (CGWB Data)    │
    └────────┬────────┘
            │
            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  EXTRACTION LAYER (master-extract.py, debug_page1.py)      │
    │  • PDF → CSV conversion using Camelot                      │
    │  • Smart filtering (5 blocks/district, year ≥2015)         │
    │  • Station ID generation                                    │
    └────────┬────────────────────────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  PREPARATION LAYER (dataset_prep.ipynb)                     │
    │  • Data cleaning & validation                               │
    │  • Temporal processing (January annual data)                │
    │  • Baseline computation (mean, min, max, std)               │
    │  • Quality control (WL ≤ 50 mbgl, edge cases)               │
    └────────┬────────────────────────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  ANALYTICS LAYER (GAVI_Computation.ipynb)                   │
    │  • GAVI Index computation                                   │
    │  • Multi-layered alert system                               │
    │  • District & state aggregation                             │
    │  • Predictive forecasting (1y & 3y)                         │
    └────────┬────────────────────────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  OUTPUT LAYER (11 CSV files)                                │
    │  • Historical GAVI & alerts                                 │
    │  • District/state summaries                                 │
    │  • Future forecasts & predictions                           │
    └─────────────────────────────────────────────────────────────┘
    ```

    ---

    ## Services & Capabilities

    ### ✅ 1. Data Extraction Service
    **Files:** `master-extract.py`, `debug_page1.py`

    **Features:**
    - Automated PDF → CSV pipeline using Camelot & Ghostscript
    - Batch processing (10 pages at a time)
    - Smart filtering:
    - Maximum 5 blocks per district (representative sampling)
    - Year cutoff filter (data ≥ 2015)
    - Automatic stop on older data detection
    - Unique station ID generation: `STATE{counter}`
    - Stream-based writing for memory efficiency

    **Technical Stack:**
    - `camelot-py` for table extraction
    - `pypdf` for PDF reading
    - `pandas` for data handling
    - Ghostscript for rendering

    ---

    ### ✅ 2. Data Preparation Pipeline
    **File:** `dataset_prep.ipynb`

    **Processing Stages:**

    #### Stage 1: Initial Processing
    - Data loading & EDA
    - Statistical summaries
    - Missing value analysis
    - Data visualization

    #### Stage 2: Station Identification
    - Unique `station_id` creation: `{STATE}_{LAT}_{LON}`
    - Coordinate rounding (4 decimal places)
    - Geospatial consistency validation

    #### Stage 3: Temporal Processing
    - DATE conversion (DD-MM-YYYY format)
    - Sorting by station & date
    - Filtered stations with ≥6 observations
    - **Focus on January data only** (annual monitoring)
    - Year extraction (2015-2024 range)

    #### Stage 4: Baseline Computation
    Per-station statistics:
    - `mean_wl`: Average water level
    - `min_wl`: Historical minimum
    - `max_wl`: Historical maximum
    - `std_wl`: Standard deviation

    #### Stage 5: Trend Analysis
    - Year-on-year change calculation: `delta_wl`
    - Early stress signal detection
    - Declining/improving trend identification

    #### Stage 6: Quality Control
    - **Outlier removal:** WL > 50 mbgl filtered (unconfined aquifer focus)
    - **Edge case handling:** Removed stations where max_wl == min_wl
    - Data validation & integrity checks

    **Output Files:**
    - `groundwater_filtered_clean.csv` - Clean processed data
    - `station_baseline.csv` - Station-level baselines
    - `groundwater_2015_2024_complete.csv` - Complete dataset with station_id

    ---

    ### ✅ 3. GAVI Computation Engine
    **File:** `GAVI_Computation.ipynb` (Section 1-4)

    #### GAVI Formula
    ```
    GAVI = 100 × (1 - (WL_current - WL_min) / (WL_max - WL_min))
    ```

    **Where:**
    - `WL_current`: Current water level (meters below ground level)
    - `WL_min`: Historical minimum water level
    - `WL_max`: Historical maximum water level
    - Range: 0-100 (higher = better groundwater availability)

    #### GAVI Categories

    | Category | GAVI Range | Status | Action Required |
    |----------|------------|--------|-----------------|
    | 🟢 **Safe** | 75-100 | Excellent groundwater availability | Regular monitoring |
    | 🟡 **Watch** | 50-74 | Moderate stress developing | Increased monitoring |
    | 🟠 **Stressed** | 25-49 | Significant depletion | Demand regulation |
    | 🔴 **Critical** | 0-24 | Severe groundwater crisis | Emergency intervention |

    **Output:** `groundwater_gavi_2015_2024.csv`

    ---

    ### ✅ 4. Multi-Layered Alert System

    #### Alert Types (Priority Hierarchy)

    | Priority | Alert Type | Condition | Severity | Action |
    |----------|-----------|-----------|----------|---------|
    | 1 | 🔴 **CRITICAL_GROUNDWATER** | GAVI < 25 | CRITICAL | Extraction restriction, emergency planning |
    | 2 | 🟠 **DEPLETION_WARNING** | GAVI < 50 AND delta_wl < 0 | HIGH | Monitoring, demand regulation |
    | 3 | 🟡 **SUDDEN_DROP** | delta_wl ≤ -2.0 m | MEDIUM | Field verification required |
    | 4 | 🟢 **RECOVERY_SIGNAL** | delta_wl ≥ +1.0 m | POSITIVE | Recharge success validation |
    | 5 | ⚪ **NORMAL** | Default | NORMAL | Continue regular monitoring |

    #### Advanced Features

    **Persistence Checking:**
    - Critical alerts require 2+ consecutive observations
    - Reduces false positives
    - Ensures alert stability before triggering

    **Alert Confirmation:**
    - Rolling window analysis (3 observations)
    - Filters transient anomalies
    - Confirmed alerts only trigger actions

    **Output Files:**
    - `groundwater_gavi_alerts_2015_2024.csv` - Complete alert history
    - `district_level_alerts.csv` - District aggregation
    - `district_stress_summary.csv` - Stress ratio analysis
    - `state_alert_summary.csv` - State-level summary

    ---

    ### ✅ 5. Aggregation & Intelligence Layer

    #### District-Level Analysis
    - Alert counts by type
    - Stressed station ratio (% with GAVI < 50 in latest observation)
    - Average GAVI scores
    - Critical/depletion alert distribution

    **Stressed Station Definition (UPDATED):**
    - **Current Stress:** Stations where latest (2024) observation has GAVI < 50
    - Percentage of currently stressed stations per district
    - Sorted by stress severity
    - Fixed calculation to reflect current conditions instead of historical aggregation

    **Key Fix Applied:**
    - Previous method aggregated ANY historical stress → resulted in 100% stressed districts
    - Current method uses ONLY latest observation per station → accurate 43.3% national stress rate
    - District-level maps and visualizations now reflect real-time conditions

    #### State-Level Summary
    - Total monitoring stations
    - Average GAVI
    - Alert distribution (critical, depletion, recovery)
    - Stressed station percentage
    - Policy-ready statements

    ---

    ### ✅ 6. Predictive Forecasting Service
    **File:** `GAVI_Computation.ipynb` (Section 5)

    #### Baseline Forecast Model

    **Model Logic:**
    ```
    Future_WL = Last_WL + Mean_Historical_Delta
    ```

    **Features:**
    - 1-year forecast
    - 3-year forecast
    - Clipped to 0-50 mbgl range
    - Station-level predictions

    #### Future GAVI Conversion

    **Process:**
    1. Forecast water levels (1y, 3y)
    2. Convert to GAVI using baseline (min_wl, max_wl)
    3. Clip to 0-100 range
    4. Apply GAVI categories

    #### Predictive Alert Logic

    | Alert Type | Condition (1-year) | Condition (3-year) |
    |-----------|-------------------|-------------------|
    | 🔴 **FUTURE_CRITICAL** | Forecast GAVI < 25 | Forecast GAVI < 25 |
    | 🟠 **EARLY_DEPLETION_WARNING** | GAVI drops ≥10 points | GAVI drops ≥15 points |
    | 🟢 **RECOVERY_EXPECTED** | GAVI improves ≥10 points | GAVI improves ≥15 points |
    | ⚪ **STABLE** | No significant change | No significant change |

    #### Model Validation

    **Methodology:**
    - Backtest: Train on 2015-2022 → Predict 2023
    - Metrics:
    - Mean Absolute Error (MAE)
    - Relative MAE (%)
    - Accuracy within 1m, 2m

    **Output Files:**
    - `groundwater_forecast_gavi_alerts.csv` - Complete forecast dataset
    - `critical_future_alerts.csv` - Stations requiring immediate attention
    - `district_future_alerts.csv` - District-level future risk assessment

    ---

    ## Output Files

    ### Generated Datasets (14 files)

    | # | Filename | Description | Records |
    |---|----------|-------------|---------|
    | 1 | `groundwater_2015_2024.csv` | Raw extracted data | 86,912 |
    | 2 | `groundwater_2015_2024_complete.csv` | Complete with station_id | 86,912 |
    | 3 | `groundwater_filtered_clean.csv` | Cleaned & filtered data | 86,912 |
    | 4 | `station_baseline.csv` | Station-level baselines | 9,632 stations |
    | 5 | `groundwater_gavi_2015_2024.csv` | Historical GAVI scores | 86,515 |
    | 6 | `groundwater_gavi_alerts_2015_2024.csv` | Complete alert history | 86,515 |
    | 7 | `district_level_alerts.csv` | District alert counts | By district |
    | 8 | `district_stress_summary.csv` | District stress analysis (historical) | 713 districts |
    | 9 | `state_alert_summary.csv` | State-level summary | By state |
    | 10 | `groundwater_forecast_gavi_alerts.csv` | Future predictions (1y, 3y) | 9,545 stations |
    | 11 | `critical_future_alerts.csv` | Critical future cases | Filtered |
    | 12 | `district_future_alerts.csv` | District future risk | 713 districts |

    ### Visualization Outputs (7+ files)

    | # | Filename | Description | Type |
    |---|----------|-------------|------|
    | 1 | `district_stress_chart.html` | Top 30 stressed districts | Interactive bar chart |
    | 2 | `station_alert_map.html` | 9,339 stations with clustering | Interactive map (Folium) |
    | 3 | `groundwater_dashboard.html` | 4-panel comprehensive view | Multi-chart dashboard |
    | 4 | `critical_districts_table.html` | Top 15 critical districts | Interactive table |
    | 5-7 | `station_timeseries_*.html` | 3 critical station charts | Time series + forecast |

    ---

    ## Key Metrics

    ### Data Coverage
    - **Time Period:** 2015-2024 (10 years)
    - **Frequency:** Annual (January observations)
    - **Total Monitoring Stations:** 9,545
    - **Total Records:** 86,912
    - **Geographic Coverage:** Multiple states across India
    - **Data Source:** CGWB (Central Ground Water Board)

    ### Current Status (Latest 2024 Snapshot)
    - **Stations Under Stress (GAVI < 50):** 4,133 (43.3%)
    - **Safe Stations (GAVI ≥ 50):** 5,412 (56.7%)
    - **Active Critical Alerts:** 1,109
    - **Average National GAVI:** 54.1
    - **Districts Analyzed:** 713

    ### Alert System
    - **Current Alert Types:** 4 (Critical, Warning, Sudden Drop, Recovery)
    - **Future Alert Types:** 3 (Future Critical, Early Warning, Recovery Expected)
    - **GAVI Categories:** 4 levels (Safe → Critical)
    - **Severity Levels:** 5 (Critical, High, Medium, Positive, Normal)

    ### Forecasting
    - **Forecast Horizons:** 1-year & 3-year
    - **Forecast Method:** Trend-based (mean historical delta)
    - **Validation Method:** Backtesting (2015-2022 → 2023)
    - **Quality Control:** WL clipped to 0-50 mbgl

    ### Computational Filters
    - **Maximum blocks per district:** 5
    - **Minimum years per station:** 5 (for forecasting)
    - **Minimum observations per station:** 6 (for baseline)
    - **WL threshold:** ≤ 50 mbgl (unconfined aquifer focus)

    ---

    ## Getting Started

    ### Prerequisites

    ```bash
    # Python packages
    pip install pandas numpy matplotlib seaborn
    pip install camelot-py[cv] pypdf tqdm

    # System dependencies
    # Install Ghostscript: https://www.ghostscript.com/download/gsdnld.html
    ```

    ### Environment Setup

    ```python
    import os
    os.environ["GHOSTSCRIPT_PATH"] = r"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"
    ```

    ### Running the Pipeline

    #### 1. Data Extraction
    ```bash
    python master-extract.py
    ```
    **Output:** `output/groundwater_2015_2024.csv`

    #### 2. Data Preparation
    Open and run all cells in `dataset_prep.ipynb`

    **Outputs:**
    - `output/groundwater_filtered_clean.csv`
    - `output/station_baseline.csv`
    - `output/groundwater_2015_2024_complete.csv`

    #### 3. GAVI Computation & Alerts
    Open and run all cells in `GAVI_Computation.ipynb`

    **Outputs:**
    - `output/groundwater_gavi_2015_2024.csv`
    - `output/groundwater_gavi_alerts_2015_2024.csv`
    - `output/district_level_alerts.csv`
    - `output/district_stress_summary.csv`
    - `output/state_alert_summary.csv`
    - `output/groundwater_forecast_gavi_alerts.csv`
    - `output/critical_future_alerts.csv`
    - `output/district_future_alerts.csv`

    ---

    ## Project Structure

    ```
    tabula/
    ├── README.md                          # This file
    ├── master-extract.py                  # PDF extraction script
    ├── debug_page1.py                     # Debug extraction tool
    ├── dataset_prep.ipynb                 # Data preparation notebook
    ├── GAVI_Computaion.ipynb             # GAVI & forecasting notebook
    ├── input/
    │   └── groundwater.pdf               # Source PDF data
    ├── output/
    │   ├── groundwater_2015_2024.csv
    │   ├── groundwater_2015_2024_complete.csv
    │   ├── groundwater_filtered_clean.csv
    │   ├── station_baseline.csv
    │   ├── groundwater_gavi_2015_2024.csv
    │   ├── groundwater_gavi_alerts_2015_2024.csv
    │   ├── district_level_alerts.csv
    │   ├── district_stress_summary.csv
    │   ├── state_alert_summary.csv
    │   ├── groundwater_forecast_gavi_alerts.csv
    │   ├── critical_future_alerts.csv
    │   └── district_future_alerts.csv
    └── temp/                             # Temporary processing files
    ```

    ---

    ## Methodology

    ### GAVI Index Development

    The **Groundwater Availability Vulnerability Index (GAVI)** is a normalized score (0-100) that measures groundwater availability relative to historical extremes:

    **Interpretation:**
    - **GAVI = 100:** Water level at historical best (WL = min_wl)
    - **GAVI = 0:** Water level at historical worst (WL = max_wl)
    - Higher GAVI = Better groundwater availability

    **Advantages:**
    - Station-specific normalization (accounts for local geology)
    - Comparable across regions
    - Intuitive scale (0-100)
    - Policy-friendly categories

    ### Alert System Design

    **Hierarchy Principle:**
    Alerts are prioritized by severity, with critical groundwater conditions taking precedence over trend-based alerts.

    **Persistence Requirement:**
    Critical alerts require confirmation over multiple observations to avoid false alarms due to:
    - Measurement errors
    - Seasonal anomalies
    - Data entry issues

    **Action Mapping:**
    Each alert type is linked to specific policy interventions, enabling automated decision support.

    ### Forecasting Approach

    **Baseline Model Choice:**
    - **Linear trend extrapolation** chosen for transparency and interpretability
    - Suitable for policy communication
    - Computationally lightweight
    - Benchmarks future ML models

    **Validation Strategy:**
    - Backtest on historical data (2015-2022 → 2023)
    - Mean Absolute Error (MAE) as primary metric
    - Accuracy bands (within 1m, 2m) for practical assessment

    ---

    ## Innovation Highlights

    ### 🔥 Anticipation vs. Detection
    Traditional systems only detect current problems. This system **predicts future crises**, enabling proactive policy intervention.

    ### 🎯 Multi-Level Intelligence
    - **Station-level:** Granular monitoring
    - **District-level:** Administrative action
    - **State-level:** Policy planning

    ### 🔄 Persistence Filtering
    Reduces false positives by requiring confirmation over multiple observations.

    ### 📊 Policy-Ready Outputs
    - Pre-computed stress ratios (current vs. historical)
    - Actionable alert statements
    - District rankings by severity
    - Real-time vs. predictive analysis

    ### 🎯 Current Snapshot Methodology
    - Temporal aggregation fix: latest observation per station
    - Accurate stress percentages (43.3% vs. inflated 100%)
    - Current conditions for visualization and decision-making
    - Historical data preserved for trend analysis

    ### 🚀 Scalable Architecture
    - Stream-based processing for large datasets
    - Modular pipeline (extraction → preparation → analytics)
    - Configurable thresholds and parameters

    ---

    ## Next Steps

    ### Phase 1: Visualization Layer ✅ COMPLETE
    - [x] Interactive maps (Folium/Plotly)
    - [x] Time series charts (station-level trends)
    - [x] District heatmaps (stress visualization)
    - [x] Forecast vs. actual comparison plots
    - [x] Comprehensive dashboard (4-panel overview)
    - [x] Critical districts table (top 15)

    **Visualizations Created:**
    - `district_stress_chart.html` - Top 30 stressed districts bar chart
    - `station_alert_map.html` - Interactive map with 9,339 stations
    - `groundwater_dashboard.html` - 4-panel comprehensive dashboard
    - `critical_districts_table.html` - Presentation-ready table
    - `station_timeseries_*.html` - Historical + forecast charts for critical stations

    ### Phase 2: API Development (Planned)
    - [ ] RESTful API for data access
    - [ ] Endpoint: Get station GAVI
    - [ ] Endpoint: Get district alerts
    - [ ] Endpoint: Get future forecasts
    - [ ] Real-time alert notifications

    ### Phase 3: Dashboard (Planned)
    - [ ] Web-based monitoring dashboard
    - [ ] Real-time alert feed
    - [ ] Interactive filtering (state/district)
    - [ ] Downloadable reports

    ### Phase 4: Advanced Analytics (Future)
    - [ ] ML-based forecasting (LSTM, Prophet)
    - [ ] Monsoon correlation analysis
    - [ ] Climate change impact modeling
    - [ ] Aquifer classification refinement

    ### Phase 5: Integration (Future)
    - [ ] CGWB database integration
    - [ ] SMS/email alert system
    - [ ] GIS platform integration
    - [ ] Policy recommendation engine

    ---

    ## Technical Specifications

    ### Dependencies
    ```
    pandas>=1.5.0
    numpy>=1.23.0
    matplotlib>=3.6.0
    seaborn>=0.12.0
    camelot-py>=0.11.0
    pypdf>=3.0.0
    tqdm>=4.64.0
    ```

    ### System Requirements
    - Python 3.8+
    - Ghostscript 10.0+
    - 4GB RAM minimum (8GB recommended for large datasets)
    - 500MB disk space for outputs

    ### Performance
    - **Extraction:** ~10-20 pages/second
    - **Processing:** ~10,000 records/second
    - **GAVI computation:** ~5,000 records/second
    - **Forecasting:** ~1,000 stations/second

    ---

    ## Data Dictionary

    ### Key Columns

    | Column | Description | Type | Range/Format |
    |--------|-------------|------|--------------|
    | `station_id` | Unique station identifier | String | `{STATE}{counter}` |
    | `STATE_UT` | State/Union Territory | String | Full name |
    | `DISTRICT` | District name | String | Full name |
    | `BLOCK` | Block name | String | Full name |
    | `LATITUDE` | Latitude coordinate | Float | Decimal degrees |
    | `LONGITUDE` | Longitude coordinate | Float | Decimal degrees |
    | `DATE` | Observation date | DateTime | YYYY-MM-DD |
    | `year` | Observation year | Integer | 2015-2024 |
    | `WL_MBGL` | Water level (meters below ground) | Float | 0-50 |
    | `delta_wl` | Year-on-year change | Float | Meters |
    | `GAVI` | Groundwater availability index | Float | 0-100 |
    | `GAVI_CATEGORY` | GAVI category | String | Safe/Watch/Stressed/Critical |
    | `ALERT` | Primary alert type | String | See alert types |
    | `ALERT_CONFIRMED` | Persistence-confirmed alert | String | See alert types |
    | `ALERT_SEVERITY` | Severity level | String | CRITICAL/HIGH/MEDIUM/POSITIVE/NORMAL |
    | `SUGGESTED_ACTION` | Recommended intervention | String | Action description |
    | `min_wl` | Historical minimum WL | Float | Meters |
    | `max_wl` | Historical maximum WL | Float | Meters |
    | `mean_wl` | Historical mean WL | Float | Meters |
    | `std_wl` | Historical std deviation | Float | Meters |
    | `WL_forecast_1y` | 1-year WL forecast | Float | 0-50 |
    | `WL_forecast_3y` | 3-year WL forecast | Float | 0-50 |
    | `GAVI_forecast_1y` | 1-year GAVI forecast | Float | 0-100 |
    | `GAVI_forecast_3y` | 3-year GAVI forecast | Float | 0-100 |
    | `FUTURE_ALERT_1y` | 1-year predictive alert | String | See future alerts |
    | `FUTURE_ALERT_3y` | 3-year predictive alert | String | See future alerts |

    ---

    ## Contributing

    This project is currently in active development. Contributions, suggestions, and feedback are welcome.

    ---

    ## License

    Data source: Central Ground Water Board (CGWB), Ministry of Jal Shakti, Government of India

    ---

    ## Contact & Support

    For questions, issues, or collaboration opportunities, please refer to the project documentation or contact the development team.

    ---

    ## Acknowledgments

    - **CGWB** for providing groundwater monitoring data
    - **Camelot** team for PDF extraction tools
    - **Pandas** community for data processing capabilities

    ---

    **Status:** ✅ Core analytics + visualization infrastructure complete and operational

    **Last Updated:** January 3, 2026

    **Version:** 1.1.0

    **Recent Updates:**
    - ✅ Added comprehensive visualization layer (7 interactive charts/maps)
    - ✅ Fixed district stress calculation (current vs. historical aggregation)
    - ✅ Implemented current snapshot methodology (43.3% accurate stress rate)
    - ✅ Created policy-ready presentation materials
    - ✅ Generated time series forecasts with visual overlays
