# JalDrishti Streamlit Dashboard

## Overview

This Streamlit application provides an interactive, one-stop demonstration of all groundwater monitoring computations, replacing multiple HTML files with a unified web interface.

## Features

### 🏠 Overview Dashboard
- National-level key metrics (total stations, avg GAVI, stressed stations, critical alerts)
- National GAVI trend visualization (2015-2024)
- Current alert distribution pie chart
- GAVI category distribution bar chart

### 📈 GAVI Analysis
- Interactive GAVI distribution histogram
- State and year range filters
- GAVI statistics (mean, median, std dev)
- Temporal evolution with min/max bands
- Detailed explanation of GAVI formula and categories

### 🚨 Alert System
- Multi-layered alert type breakdown
- Alert trends over time
- Current alert counts by severity
- Suggested actions table
- Priority hierarchy explanation

### 🗺️ Geographic Analysis
- State-level stressed station rankings
- Top 20 most stressed districts visualization
- Multi-state comparison tool
- Interactive bar charts with hover details

### 🔮 Forecasting
- 1-year and 3-year predictions
- Future critical alert counts
- Current vs forecasted GAVI comparison
- Stations predicted to become critical
- Future alert distribution pie charts

### 📍 Station Explorer
- Individual station selection
- Station metadata display
- Historical water level and GAVI time series
- Forecast overlay on charts
- Alert history table

## Installation

1. Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

2. Verify that all required CSV files exist in the `output/` directory:
   - `groundwater_gavi_alerts_2015_2024.csv`
   - `district_stress_summary.csv`
   - `state_alert_summary.csv`
   - `groundwater_forecast_gavi_alerts.csv`

## Running the Application

### Local Development
```bash
streamlit run app.py
```

The application will open in your default browser at `http://localhost:8501`

### Production Deployment

#### Option 1: Streamlit Cloud
1. Push your code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect your repository
4. Deploy!

#### Option 2: Docker
```bash
# Build image
docker build -t jaldrishti-app .

# Run container
docker run -p 8501:8501 jaldrishti-app
```

#### Option 3: Custom Server
```bash
# Run on specific port
streamlit run app.py --server.port 8080

# Run with custom config
streamlit run app.py --server.address 0.0.0.0 --server.port 8501
```

## Usage Guide

### Navigation
Use the sidebar radio buttons to switch between different analysis pages:
- **Overview**: High-level dashboard with key metrics
- **GAVI Analysis**: Deep dive into GAVI scores and distributions
- **Alert System**: Alert trends and severity analysis
- **Geographic Analysis**: State and district-level comparisons
- **Forecasting**: Future predictions and risk assessment
- **Station Explorer**: Individual station time series and history

### Filters
- **State Filter**: Available in GAVI Analysis page
- **Year Range Slider**: Filter data by time period
- **Multi-State Selector**: Compare multiple states in Geographic Analysis
- **Station Selector**: Explore individual stations in Station Explorer

### Interactivity
- **Hover**: Hover over charts to see detailed values
- **Zoom**: Click and drag to zoom into chart regions
- **Pan**: Use pan tool to navigate zoomed charts
- **Download**: Use camera icon to download chart images

## Data Requirements

The application expects the following CSV files in the `output/` directory:

| File | Required Columns |
|------|------------------|
| `groundwater_gavi_alerts_2015_2024.csv` | station_id, STATE_UT, DISTRICT, LATITUDE, LONGITUDE, DATE, year, WL_MBGL, GAVI, GAVI_CATEGORY, ALERT_CONFIRMED, ALERT_SEVERITY, SUGGESTED_ACTION, delta_wl |
| `district_stress_summary.csv` | STATE_UT, DISTRICT, total_stations, stressed_ratio, avg_gavi, critical_alerts |
| `state_alert_summary.csv` | STATE_UT, total_stations, avg_gavi, critical_count, depletion_count, recovery_count, stressed_pct |
| `groundwater_forecast_gavi_alerts.csv` | station_id, STATE_UT, DISTRICT, GAVI, GAVI_forecast_1y, GAVI_forecast_3y, FUTURE_ALERT_1y, FUTURE_ALERT_3y |

## Customization

### Styling
Modify the CSS in the `st.markdown()` section at the top of `app.py`:
```python
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
    }
</style>
""", unsafe_allow_html=True)
```

### Color Schemes
Update color maps in chart definitions:
```python
color_discrete_map={
    'NORMAL': '#90EE90',
    'CRITICAL_GROUNDWATER': '#FF4500'
}
```

### Metrics
Add new metrics in the overview section:
```python
st.metric("New Metric", value, delta)
```

## Performance Optimization

### Caching
The app uses `@st.cache_data` to cache data loading:
```python
@st.cache_data
def load_data():
    # Data loading logic
    return data
```

### Large Datasets
For datasets > 100MB:
1. Use `@st.cache_resource` for persistent connections
2. Implement pagination in tables
3. Use data aggregation before visualization

## Troubleshooting

### Common Issues

**Issue**: "Error loading data"
- **Solution**: Verify all CSV files exist in `output/` directory
- Check file paths are correct
- Ensure CSV files are not corrupted

**Issue**: Charts not displaying
- **Solution**: Update plotly: `pip install --upgrade plotly`
- Clear browser cache
- Check browser console for JavaScript errors

**Issue**: Slow performance
- **Solution**: Reduce data size with filters
- Enable caching with `@st.cache_data`
- Use data sampling for large visualizations

**Issue**: Port already in use
- **Solution**: Use different port: `streamlit run app.py --server.port 8502`
- Kill existing process: `pkill -f streamlit`

## Architecture

```
app.py
├── main()                          # Entry point
├── load_data()                     # Data loading with caching
├── show_overview()                 # Overview dashboard
├── show_gavi_analysis()            # GAVI analysis page
├── show_alert_system()             # Alert system page
├── show_geographic_analysis()      # Geographic analysis page
├── show_forecasting()              # Forecasting page
└── show_station_explorer()         # Station explorer page
```

## Technology Stack

- **Frontend**: Streamlit
- **Visualization**: Plotly (interactive charts)
- **Data Processing**: Pandas, NumPy
- **Styling**: Custom CSS

## Benefits Over HTML Files

1. **Single Interface**: All computations in one place
2. **Interactive Filters**: Dynamic data exploration
3. **Real-time Updates**: Instant chart updates on filter changes
4. **Responsive Design**: Works on desktop, tablet, and mobile
5. **Easy Deployment**: One-click deployment to Streamlit Cloud
6. **Maintainable**: Single codebase vs multiple HTML files
7. **Extensible**: Easy to add new pages and features

## Future Enhancements

- [ ] Add map visualization with Folium/Plotly
- [ ] Export filtered data to CSV
- [ ] PDF report generation
- [ ] Email alert notifications
- [ ] Real-time data refresh
- [ ] User authentication
- [ ] Custom dashboard builder
- [ ] API integration

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Streamlit documentation: https://docs.streamlit.io
3. Check Plotly documentation: https://plotly.com/python/

## License

Same as parent project (see main README.md)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
