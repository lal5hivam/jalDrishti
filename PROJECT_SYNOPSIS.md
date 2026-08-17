# JALDRISHTI

## A GROUNDWATER MONITORING AND PREDICTIVE ALERT SYSTEM

**PROJECT SYNOPSIS**

OF MINOR PROJECT

**Submitted in partial fulfilment of the requirements for the award of the degree of
Bachelor of Technology in Computer Science & Engineering**

SUBMITTED BY

**\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (Student Name)**
**\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (University Roll Number)**

Branch: Computer Science & Engineering
Batch: 2023 – 2027

August 2026

SUBMITTED TO

**DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
INVERTIS UNIVERSITY
Bareilly-Lucknow National Highway NH-24, Bareilly 243123**

---

## Index

| Section | Title | Page |
|---|---|---|
| 1 | Introduction | 3 |
| 2 | Feasibility Study | 6 |
| 3 | Methodology / Planning of Work | 7 |
| 4 | Facilities Required for Proposed Work | 8 |
| 5 | Bibliography | 9 |

### Notations and Nomenclature

*Table 1: Abbreviations and technical notations used in this synopsis.*

| Notation | Expansion / Meaning |
|---|---|
| CGWB | Central Ground Water Board, Ministry of Jal Shakti, Government of India |
| GAVI | Groundwater Availability Vulnerability Index — the normalised 0–100 score defined by this project |
| WL | Water level, measured downward from the ground surface |
| mbgl | Metres below ground level; a larger value means a deeper, i.e. worse, water table |
| ΔWL (delta_wl) | Year-on-year change in water level for a monitoring station |
| Baseline | Per-station historical statistics: mean, minimum, maximum and standard deviation of WL |
| Station ID | Unique key formed as {STATE}_{LATITUDE}_{LONGITUDE} |
| MAE | Mean Absolute Error, the primary forecast accuracy metric |
| EDA | Exploratory Data Analysis |
| ETL | Extract, Transform, Load — the data pipeline pattern followed |
| Stress ratio | Percentage of a district's stations whose latest observation has GAVI < 50 |

---

## 1. Introduction

### 1.1 Background of the Problem

India is the largest consumer of groundwater in the world. Approximately 63 per cent of the country's irrigated area and 85 per cent of its rural drinking water supply are drawn from beneath the ground, yet the resource itself is invisible and is therefore managed reactively. The Central Ground Water Board (CGWB) maintains a national network of observation wells and publishes the recorded water levels every year, but this information is released as large, unstructured PDF documents. In that form the data cannot be queried, compared across regions, or turned into an early warning. A district administration typically learns that its water table has fallen only after wells begin to fail.

Four gaps follow from this. First, management is reactive rather than anticipatory. Second, the data is fragmented and locked in documents. Third, no operational forecast of future availability exists at the level of an individual monitoring station. Fourth, the raw depth-to-water figure is not comparable between regions, because a level of ten metres is normal in one aquifer and alarming in another.

### 1.2 The Proposed System

*JalDrishti* (from *jal*, water, and *drishti*, vision) is an end-to-end software system that converts a decade of CGWB observations into a monitored, scored, alerted and forecast decision-support dashboard. The working dataset covers 86,912 observations recorded at 9,545 monitoring stations across 713 districts and 31 states between 2015 and 2024. January readings are used throughout, so that every station is compared with itself at the same point in the annual recharge cycle.

The system is organised as five layers. The **extraction layer** converts the source PDF into structured records. The **preparation layer** cleans the records, derives a per-station baseline and applies quality control. The **analytics layer** computes the GAVI score and generates alerts. The **forecasting layer** projects each station one and three years forward. The **presentation layer** serves the results as an interactive web dashboard.

### 1.3 The GAVI Index

The central technical contribution of the project is the **Groundwater Availability Vulnerability Index (GAVI)**, a normalised score that makes stations comparable by rescaling each one against its own historical extremes:

> **GAVI = 100 × [ 1 − (WL_current − WL_min) / (WL_max − WL_min) ]**

A score of 100 places the station at its historical best and a score of 0 at its historical worst. Because the normalisation is station-specific, local geology and aquifer type are absorbed into the baseline, and a score of 30 carries the same meaning in Rajasthan as in Odisha. The continuous score is then banded into four policy-facing categories.

*Table 2: GAVI categories and the administrative response associated with each.*

| Category | GAVI range | Interpretation and indicated action |
|---|---:|---|
| Safe | 75 – 100 | Good availability; continue routine monitoring |
| Watch | 50 – 74 | Moderate stress developing; increase observation frequency |
| Stressed | 25 – 49 | Significant depletion; regulate demand and plan recharge |
| Critical | 0 – 24 | Severe deficit; emergency intervention and extraction control |

### 1.4 Alert Generation

A multi-layered rule engine converts scores and trends into named alerts, resolved by a strict priority order so that each station carries exactly one alert per year. Critical conditions take precedence over trend-based signals.

*Table 3: Alert hierarchy applied to every station-year record.*

| Priority | Alert type | Triggering condition |
|---:|---|---|
| 1 | CRITICAL_GROUNDWATER | GAVI < 25 |
| 2 | DEPLETION_WARNING | GAVI < 50 and ΔWL indicates a falling table |
| 3 | SUDDEN_DROP | Water level falls by 2.0 m or more in one year |
| 4 | RECOVERY_SIGNAL | Water level rises by 1.0 m or more in one year |
| 5 | NORMAL | No rule satisfied; routine monitoring continues |

To suppress false alarms arising from measurement error or a single anomalous season, a **persistence check** requires a critical alert to appear in two or more consecutive observations before it is treated as confirmed, and a rolling window of three observations is used to filter transient spikes.

### 1.5 Predictive Forecasting

Each station is projected forward using a transparent trend model, *WL_future = WL_last + mean historical ΔWL*, evaluated at horizons of one and three years and clipped to the physically meaningful range of 0 to 50 mbgl. The projected level is converted back into a GAVI score using the same station baseline, which yields forward-looking alerts: FUTURE_CRITICAL where the projected score falls below 25, EARLY_DEPLETION_WARNING where it declines materially, and RECOVERY_EXPECTED where it improves. The model is validated by backtesting: it is fitted on the years 2015 to 2022, used to predict 2023, and scored on mean absolute error together with the proportion of stations predicted within one and two metres. A deliberately simple and interpretable model was chosen as the first baseline, both because it can be explained to a non-technical administrator and because it establishes the benchmark that later machine-learning models must beat.

### 1.6 Technology Used

The system is written entirely in **Python 3.11**. Table extraction from the source PDF uses **Camelot** with **Ghostscript** and **pypdf**; cleaning, baseline computation and index calculation use **pandas** and **NumPy**; exploratory analysis is carried out in **Jupyter Notebook**. The dashboard is built with **Streamlit**, with interactive charts in **Plotly** and clustered station maps in **Folium**. The application is containerised with **Docker** for deployment on an **AWS EC2** instance, and the source is version-controlled with **Git**.

### 1.7 Field of the Project

The project belongs to **data engineering and applied data science**, specialised towards **hydro-informatics** — the application of computing to water resource management. It combines three sub-disciplines: document data extraction, time-series analysis of environmental measurements, and geospatial visualisation for decision support.

### 1.8 Objectives

- To build an automated pipeline that converts published CGWB water level reports into a clean, analysis-ready dataset.
- To define and compute the GAVI index so that groundwater availability becomes comparable across stations, districts and states.
- To implement a prioritised, persistence-checked alert engine that maps each condition to a specific administrative action.
- To forecast station-level water levels at one-year and three-year horizons and validate them by backtesting.
- To aggregate station results to district and state level for policy use.
- To deliver the whole analysis as an interactive, deployable web dashboard usable by non-technical officials.

---

## 2. Feasibility Study

### 2.1 Technical Feasibility

Every component of the system is available as mature, free and open-source software with substantial documentation, and extraction from the actual CGWB source document has already been demonstrated on the project's own data. The working dataset of 86,912 records is small enough to be processed entirely in memory on a commodity laptop, so no distributed computing infrastructure is required. The project is therefore technically feasible within an undergraduate setting.

### 2.2 Economic Feasibility

Development cost is effectively nil: the toolchain is open source, the data is published free of charge by the Government of India, and development proceeds on hardware the student already owns. The only recurring expense is optional cloud hosting for the public dashboard, which fits comfortably within a small single-instance tier and can be avoided entirely by running the application locally for demonstration.

### 2.3 Operational Feasibility

The output is designed for the people who would use it. Scores are expressed on an intuitive 0 to 100 scale, alerts are named in plain language, and every alert level is bound to a concrete action, so a district officer need not interpret hydrological units to act on the display. The dashboard runs in an ordinary web browser and requires no installation by the end user.

### 2.4 Schedule Feasibility

The work decomposes into seven short, independently testable phases, each producing a usable artefact, and fits within one academic semester. Because the layers are separated by intermediate CSV files, a delay in any one phase does not block work already completed downstream of it.

### 2.5 Legal and Ethical Feasibility

The source data is published by a central government body and carries no personal or identifying information, so no privacy or licensing obstacle arises. All third-party libraries used are permissively licensed.

### 2.6 Need and Significance

Analysis of the assembled dataset shows why the system is needed: in the most recent year covered, 43.3 per cent of monitoring stations are under stress with a GAVI below 50, over one thousand critical alerts are active, and the national average GAVI stands at 54.1. These conditions are presently distributed across hundreds of pages of tabulated PDF and are effectively unreadable at a glance. By converting the same figures into a ranked, mapped and forecast view, the project shortens the distance between measurement and intervention, and supports planning under national programmes for groundwater management and recharge.

---

## 3. Methodology / Planning of Work

An **iterative and incremental** model is followed. Each phase produces a persisted intermediate dataset, so a later phase can be re-run and refined without repeating the earlier, expensive stages — a property that proved essential when the district stress calculation had to be corrected to use only the latest observation per station rather than the whole history.

*Table 4: Phase-wise plan of work, with principal activities and deliverables.*

| Phase | Stage | Principal activities and deliverable |
|---:|---|---|
| 1 | Requirement study and data acquisition | Study groundwater monitoring practice, identify the CGWB source report, define the scope as 2015–2024 January observations. *Deliverable:* requirement note and source document. |
| 2 | Extraction layer | Batch table extraction from PDF using Camelot and Ghostscript, representative sampling of blocks per district, station identifier generation, streamed writing to CSV. *Deliverable:* raw records dataset. |
| 3 | Preparation and quality control | Exploratory analysis, date parsing, retention of stations with sufficient observation history, computation of per-station baselines and year-on-year change, removal of readings deeper than 50 mbgl and of degenerate baselines. *Deliverable:* cleaned dataset and station baseline table. |
| 4 | Analytics: GAVI and alerts | Implement the GAVI formula and categories, build the prioritised alert engine, add persistence and rolling-window confirmation, aggregate to district and state level. *Deliverable:* scored and alerted dataset with summaries. |
| 5 | Forecasting and validation | Fit the trend model, generate one-year and three-year projections, convert projections to future GAVI and predictive alerts, backtest on 2015–2022 against 2023 and report MAE and accuracy bands. *Deliverable:* forecast dataset and validation report. |
| 6 | Visualisation and dashboard | Build the Streamlit application with pages for overview, GAVI analysis, alerts, geographic analysis, forecasting and station-level exploration; add caching, interactive Plotly charts and clustered Folium maps. *Deliverable:* working dashboard. |
| 7 | Deployment, testing and documentation | Containerise the application, deploy to a cloud instance, verify results end to end against the source figures, and prepare user and technical documentation. *Deliverable:* deployed system and project report. |

---

## 4. Facilities Required for Proposed Work

### 4.1 Hardware Requirements

*Table 5: Hardware required for development and deployment.*

| Component | Minimum | Recommended |
|---|---|---|
| Processor | Dual-core, 2.0 GHz | Quad-core, 2.5 GHz or higher |
| Memory | 4 GB RAM | 8 GB RAM or higher (PDF extraction is memory-intensive) |
| Storage | 10 GB free space | 20 GB free space on a solid-state drive |
| Display | 1366 × 768 | 1920 × 1080, for dashboard layout testing |
| Network | Broadband connection | Broadband connection, for data download and deployment |
| Deployment host | Local machine | Cloud virtual machine, 2 vCPU and 2 GB RAM |

### 4.2 Software Requirements

*Table 6: Software required for development and deployment.*

| Category | Software |
|---|---|
| Operating system | Windows 10 or 11, or any Linux distribution |
| Language and runtime | Python 3.11 |
| Data processing | pandas, NumPy, pyarrow |
| PDF table extraction | Camelot, pypdf, OpenCV, Ghostscript |
| Visualisation | Plotly, Folium, Matplotlib, Seaborn |
| Web application | Streamlit |
| Development environment | Jupyter Notebook, Visual Studio Code |
| Deployment | Docker, Docker Compose, an AWS EC2 instance |
| Version control | Git and a remote repository |
| Browser | Any modern browser, for using the dashboard |

---

## 5. Bibliography

1. Central Ground Water Board, *Ground Water Year Book — India*, Ministry of Jal Shakti, Government of India, Faridabad. Source of the water level observations used throughout the project.
2. Central Ground Water Board, *National Compilation on Dynamic Ground Water Resources of India*, Ministry of Jal Shakti, Government of India. Referred to for the national assessment categories and extraction statistics.
3. NITI Aayog, *Composite Water Management Index*, Government of India, 2019. Referred to for the policy framing of water stress in Indian states.
4. T. Rajaee, H. Ebrahimi and V. Nourani, "A review of the artificial intelligence methods in groundwater level modeling", *Journal of Hydrology*, vol. 572, pp. 336–353, 2019. Surveyed for the choice of a baseline forecasting method.
5. D. Sahoo, T. A. Russo, J. Elliott and I. Foster, "Machine learning algorithms for modeling groundwater level changes in agricultural regions of the U.S.", *Water Resources Research*, vol. 53, no. 5, pp. 3878–3895, 2017. Referred to for feature design and validation practice.
6. J. P. Bloomfield and B. P. Marchant, "Analysis of groundwater drought building on the standardised precipitation index approach", *Hydrology and Earth System Sciences*, vol. 17, pp. 4769–4787, 2013. The station-wise normalisation idea behind the GAVI index draws on this standardised-index approach.
7. R. J. Hyndman and G. Athanasopoulos, *Forecasting: Principles and Practice*, 3rd ed., OTexts, Melbourne, 2021. Available at https://otexts.com/fpp3/. Used for the backtesting design and the choice of mean absolute error as the accuracy metric.
8. W. McKinney, "Data Structures for Statistical Computing in Python", *Proceedings of the 9th Python in Science Conference*, pp. 51–56, 2010. Background for the pandas data model used in the preparation layer.
9. C. R. Harris et al., "Array programming with NumPy", *Nature*, vol. 585, pp. 357–362, 2020. Background for the vectorised computation of the index.
10. Camelot documentation, *Camelot: PDF Table Extraction for Humans*. Available at https://camelot-py.readthedocs.io. Used for the extraction layer, particularly the lattice and stream parsing modes.
11. Streamlit documentation. Available at https://docs.streamlit.io. Used for the multi-page dashboard structure and data caching.
12. Plotly, *Plotly Python Graphing Library*. Available at https://plotly.com/python/. Used for the interactive charts on every dashboard page.
13. Folium documentation. Available at https://python-visualization.github.io/folium/. Used for the clustered station map.
14. Docker documentation. Available at https://docs.docker.com. Used for containerising the application.
15. Amazon Web Services, *Amazon EC2 User Guide*. Available at https://docs.aws.amazon.com/ec2/. Used for the deployment configuration.

---

<!--
FORMATTING NOTE (not part of the submitted document — delete before printing)

Markdown cannot carry the university's typography specification. When pasting
this into Word, apply:
  • Times New Roman, 12 pt, British English
  • Double line spacing, one side of the page only
  • Margins: left 3.5 cm, top 2.5 cm, right 1.25 cm, bottom 1.25 cm
  • A4 paper
  • Title page on its own page, then Index, then Notations/Nomenclature
  • Section page limits: Introduction ≤ 3 pages, Feasibility ≤ 1, Methodology ≤ 1
  • Table captions above the table; figure captions below the figure

For an already-formatted, print-ready version see PROJECT_SYNOPSIS.html —
open it in a browser and print to PDF at A4, 100% scale.

TO FILL IN: student name, university roll number, batch, and submission month.
-->
