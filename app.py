import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np

# Page config
st.set_page_config(
    page_title="JalDrishti - Groundwater Monitoring System",
    page_icon="💧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #555;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)

# Load data with caching
@st.cache_data
def load_data():
    """Load all required datasets"""
    try:
        gavi_alerts = pd.read_csv("output/groundwater_gavi_alerts_2015_2024.csv")
        gavi_alerts['DATE'] = pd.to_datetime(gavi_alerts['DATE'])
        gavi_alerts['year'] = gavi_alerts['DATE'].dt.year
        
        district_stress = pd.read_csv("output/district_stress_summary.csv")
        state_summary = pd.read_csv("output/state_alert_summary.csv")
        forecast = pd.read_csv("output/groundwater_forecast_gavi_alerts.csv")
        
        return gavi_alerts, district_stress, state_summary, forecast
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None, None, None, None

# Main app
def main():
    st.markdown('<div class="main-header">💧 JalDrishti</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Groundwater Monitoring & Predictive Alert System (2015-2024)</div>', unsafe_allow_html=True)
    
    # Load data
    gavi_alerts, district_stress, state_summary, forecast = load_data()
    
    if gavi_alerts is None:
        st.error("Failed to load data. Please ensure all CSV files are in the output/ directory.")
        return
    
    # Sidebar navigation
    st.sidebar.title("📊 Navigation")
    page = st.sidebar.radio(
        "Select Analysis",
        ["🏠 Overview", "📈 GAVI Analysis", "🚨 Alert System", "🗺️ Geographic Analysis", 
         "🔮 Forecasting", "📍 Station Explorer"]
    )
    
    # Page routing
    if page == "🏠 Overview":
        show_overview(gavi_alerts, district_stress, state_summary, forecast)
    elif page == "📈 GAVI Analysis":
        show_gavi_analysis(gavi_alerts)
    elif page == "🚨 Alert System":
        show_alert_system(gavi_alerts, district_stress)
    elif page == "🗺️ Geographic Analysis":
        show_geographic_analysis(gavi_alerts, district_stress, state_summary)
    elif page == "🔮 Forecasting":
        show_forecasting(forecast, gavi_alerts)
    elif page == "📍 Station Explorer":
        show_station_explorer(gavi_alerts, forecast)

def show_overview(gavi_alerts, district_stress, state_summary, forecast):
    """Overview dashboard with key metrics"""
    st.header("📊 System Overview")
    
    # Latest year data
    latest_year = gavi_alerts['year'].max()
    latest_data = gavi_alerts[gavi_alerts['year'] == latest_year]
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Total Stations",
            f"{gavi_alerts['station_id'].nunique():,}",
            help="Total monitoring stations across India"
        )
    
    with col2:
        avg_gavi = latest_data['GAVI'].mean()
        st.metric(
            "National Avg GAVI",
            f"{avg_gavi:.1f}",
            help="Average GAVI score (0-100, higher is better)"
        )
    
    with col3:
        stressed = (latest_data['GAVI'] < 50).sum()
        stressed_pct = (stressed / len(latest_data)) * 100
        st.metric(
            "Stressed Stations",
            f"{stressed:,}",
            f"{stressed_pct:.1f}%",
            delta_color="inverse"
        )
    
    with col4:
        critical = (latest_data['ALERT_CONFIRMED'] == 'CRITICAL_GROUNDWATER').sum()
        st.metric(
            "Critical Alerts",
            f"{critical:,}",
            help="Stations with GAVI < 25"
        )
    
    st.divider()
    
    # Time series of national GAVI
    st.subheader("📈 National GAVI Trend (2015-2024)")
    yearly_gavi = gavi_alerts.groupby('year')['GAVI'].mean().reset_index()
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=yearly_gavi['year'],
        y=yearly_gavi['GAVI'],
        mode='lines+markers',
        name='Avg GAVI',
        line=dict(color='#1f77b4', width=3),
        marker=dict(size=10)
    ))
    fig.add_hline(y=50, line_dash="dash", line_color="orange", 
                  annotation_text="Stress Threshold (GAVI=50)")
    fig.update_layout(
        xaxis_title="Year",
        yaxis_title="Average GAVI",
        height=400,
        hovermode='x unified'
    )
    st.plotly_chart(fig, width='stretch')
    
    # Alert distribution
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🚨 Current Alert Distribution")
        alert_counts = latest_data['ALERT_CONFIRMED'].value_counts()
        
        fig = px.pie(
            values=alert_counts.values,
            names=alert_counts.index,
            color=alert_counts.index,
            color_discrete_map={
                'NORMAL': '#90EE90',
                'RECOVERY_SIGNAL': '#32CD32',
                'SUDDEN_DROP': '#FFD700',
                'DEPLETION_WARNING': '#FFA500',
                'CRITICAL_GROUNDWATER': '#FF4500'
            }
        )
        fig.update_traces(textposition='inside', textinfo='percent+label')
        fig.update_layout(height=400)
        st.plotly_chart(fig, width='stretch')
    
    with col2:
        st.subheader("📊 GAVI Category Distribution")
        category_counts = latest_data['GAVI_CATEGORY'].value_counts()
        
        fig = px.bar(
            x=category_counts.index,
            y=category_counts.values,
            color=category_counts.index,
            color_discrete_map={
                'Safe': '#32CD32',
                'Watch': '#FFD700',
                'Stressed': '#FFA500',
                'Critical': '#FF4500'
            }
        )
        fig.update_layout(
            xaxis_title="Category",
            yaxis_title="Number of Stations",
            height=400,
            showlegend=False
        )
        st.plotly_chart(fig, width='stretch')

def show_gavi_analysis(gavi_alerts):
    """GAVI computation and analysis"""
    st.header("📈 GAVI Analysis")
    
    st.markdown("""
    ### Groundwater Availability Vulnerability Index (GAVI)
    
    **Formula:** `GAVI = 100 × (1 - (WL_current - WL_min) / (WL_max - WL_min))`
    
    **Categories:**
    - 🟢 **Safe** (75-100): Excellent groundwater availability
    - 🟡 **Watch** (50-74): Moderate stress developing
    - 🟠 **Stressed** (25-49): Significant depletion
    - 🔴 **Critical** (0-24): Severe groundwater crisis
    """)
    
    st.divider()
    
    # Filters
    col1, col2 = st.columns(2)
    with col1:
        selected_state = st.selectbox(
            "Select State",
            ['All'] + sorted(gavi_alerts['STATE_UT'].unique().tolist())
        )
    with col2:
        year_range = st.slider(
            "Year Range",
            int(gavi_alerts['year'].min()),
            int(gavi_alerts['year'].max()),
            (int(gavi_alerts['year'].min()), int(gavi_alerts['year'].max()))
        )
    
    # Filter data
    filtered_data = gavi_alerts[
        (gavi_alerts['year'] >= year_range[0]) & 
        (gavi_alerts['year'] <= year_range[1])
    ]
    if selected_state != 'All':
        filtered_data = filtered_data[filtered_data['STATE_UT'] == selected_state]
    
    # GAVI distribution
    st.subheader("📊 GAVI Distribution")
    fig = px.histogram(
        filtered_data,
        x='GAVI',
        nbins=50,
        color_discrete_sequence=['#1f77b4']
    )
    fig.add_vline(x=25, line_dash="dash", line_color="red", annotation_text="Critical")
    fig.add_vline(x=50, line_dash="dash", line_color="orange", annotation_text="Stressed")
    fig.add_vline(x=75, line_dash="dash", line_color="green", annotation_text="Safe")
    fig.update_layout(
        xaxis_title="GAVI Score",
        yaxis_title="Frequency",
        height=400
    )
    st.plotly_chart(fig, width='stretch')
    
    # GAVI statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Mean GAVI", f"{filtered_data['GAVI'].mean():.2f}")
    with col2:
        st.metric("Median GAVI", f"{filtered_data['GAVI'].median():.2f}")
    with col3:
        st.metric("Std Dev", f"{filtered_data['GAVI'].std():.2f}")
    
    # Temporal evolution
    st.subheader("📈 GAVI Evolution Over Time")
    yearly_stats = filtered_data.groupby('year').agg({
        'GAVI': ['mean', 'min', 'max']
    }).reset_index()
    yearly_stats.columns = ['year', 'mean', 'min', 'max']
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=yearly_stats['year'],
        y=yearly_stats['mean'],
        mode='lines+markers',
        name='Mean GAVI',
        line=dict(color='blue', width=2)
    ))
    fig.add_trace(go.Scatter(
        x=yearly_stats['year'],
        y=yearly_stats['max'],
        mode='lines',
        name='Max GAVI',
        line=dict(color='green', width=1, dash='dash')
    ))
    fig.add_trace(go.Scatter(
        x=yearly_stats['year'],
        y=yearly_stats['min'],
        mode='lines',
        name='Min GAVI',
        line=dict(color='red', width=1, dash='dash')
    ))
    fig.update_layout(
        xaxis_title="Year",
        yaxis_title="GAVI Score",
        height=400,
        hovermode='x unified'
    )
    st.plotly_chart(fig, width='stretch')

def show_alert_system(gavi_alerts, district_stress):
    """Alert system analysis"""
    st.header("🚨 Multi-Layered Alert System")
    
    st.markdown("""
    ### Alert Types (Priority Hierarchy)
    
    1. 🔴 **CRITICAL_GROUNDWATER** - GAVI < 25 (Requires 2+ consecutive observations)
    2. 🟠 **DEPLETION_WARNING** - GAVI < 50 AND delta_wl < 0
    3. 🟡 **SUDDEN_DROP** - delta_wl ≤ -2.0 meters
    4. 🟢 **RECOVERY_SIGNAL** - delta_wl ≥ +1.0 meters
    5. ⚪ **NORMAL** - Default state
    """)
    
    st.divider()
    
    # Alert statistics
    latest_year = gavi_alerts['year'].max()
    latest_data = gavi_alerts[gavi_alerts['year'] == latest_year]
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        critical = (latest_data['ALERT_CONFIRMED'] == 'CRITICAL_GROUNDWATER').sum()
        st.metric("🔴 Critical", f"{critical:,}")
    
    with col2:
        depletion = (latest_data['ALERT_CONFIRMED'] == 'DEPLETION_WARNING').sum()
        st.metric("🟠 Depletion", f"{depletion:,}")
    
    with col3:
        sudden = (latest_data['ALERT_CONFIRMED'] == 'SUDDEN_DROP').sum()
        st.metric("🟡 Sudden Drop", f"{sudden:,}")
    
    with col4:
        recovery = (latest_data['ALERT_CONFIRMED'] == 'RECOVERY_SIGNAL').sum()
        st.metric("🟢 Recovery", f"{recovery:,}")
    
    # Alert trends
    st.subheader("📈 Alert Trends Over Time")
    alert_trends = gavi_alerts.groupby(['year', 'ALERT_CONFIRMED']).size().reset_index(name='count')
    
    fig = px.line(
        alert_trends,
        x='year',
        y='count',
        color='ALERT_CONFIRMED',
        color_discrete_map={
            'NORMAL': '#90EE90',
            'RECOVERY_SIGNAL': '#32CD32',
            'SUDDEN_DROP': '#FFD700',
            'DEPLETION_WARNING': '#FFA500',
            'CRITICAL_GROUNDWATER': '#FF4500'
        }
    )
    fig.update_layout(
        xaxis_title="Year",
        yaxis_title="Number of Alerts",
        height=400,
        hovermode='x unified'
    )
    st.plotly_chart(fig, width='stretch')
    
    # Suggested actions
    st.subheader("💡 Suggested Actions by Alert Type")
    actions_df = pd.DataFrame({
        'Alert Type': ['CRITICAL_GROUNDWATER', 'DEPLETION_WARNING', 'SUDDEN_DROP', 'RECOVERY_SIGNAL'],
        'Severity': ['CRITICAL', 'HIGH', 'MEDIUM', 'POSITIVE'],
        'Action': [
            'Extraction restriction, emergency planning',
            'Monitoring, demand regulation',
            'Field verification required',
            'Recharge success validation'
        ]
    })
    st.dataframe(actions_df, width='stretch', hide_index=True)

def show_geographic_analysis(gavi_alerts, district_stress, state_summary):
    """Geographic analysis"""
    st.header("🗺️ Geographic Analysis")
    
    # State-level analysis
    st.subheader("📍 State-Level Summary")
    
    # Sort by stressed percentage
    state_summary_sorted = state_summary.sort_values('stressed_pct', ascending=False)
    
    fig = px.bar(
        state_summary_sorted.head(15),
        x='stressed_pct',
        y='STATE_UT',
        orientation='h',
        color='avg_gavi',
        color_continuous_scale='RdYlGn',
        labels={'stressed_pct': 'Stressed Stations (%)', 'STATE_UT': 'State'}
    )
    fig.update_layout(height=600)
    st.plotly_chart(fig, width='stretch')
    
    # District-level analysis
    st.subheader("🏘️ Top 20 Most Stressed Districts")
    
    top_districts = district_stress.sort_values('stressed_ratio', ascending=False).head(20)
    
    fig = px.bar(
        top_districts,
        x='stressed_ratio',
        y='DISTRICT',
        orientation='h',
        color='avg_gavi',
        color_continuous_scale='RdYlGn_r',
        hover_data=['STATE_UT', 'total_stations', 'critical_alerts']
    )
    fig.update_layout(
        xaxis_title="Stressed Ratio (%)",
        yaxis_title="District",
        height=600
    )
    st.plotly_chart(fig, width='stretch')
    
    # State comparison
    st.subheader("📊 State Comparison")
    selected_states = st.multiselect(
        "Select states to compare",
        state_summary['STATE_UT'].tolist(),
        default=state_summary.nlargest(5, 'total_stations')['STATE_UT'].tolist()
    )
    
    if selected_states:
        comparison_data = state_summary[state_summary['STATE_UT'].isin(selected_states)]
        
        fig = make_subplots(
            rows=1, cols=3,
            subplot_titles=('Avg GAVI', 'Critical Alerts', 'Recovery Signals')
        )
        
        fig.add_trace(
            go.Bar(x=comparison_data['STATE_UT'], y=comparison_data['avg_gavi'], name='Avg GAVI'),
            row=1, col=1
        )
        fig.add_trace(
            go.Bar(x=comparison_data['STATE_UT'], y=comparison_data['critical_count'], name='Critical'),
            row=1, col=2
        )
        fig.add_trace(
            go.Bar(x=comparison_data['STATE_UT'], y=comparison_data['recovery_count'], name='Recovery'),
            row=1, col=3
        )
        
        fig.update_layout(height=400, showlegend=False)
        st.plotly_chart(fig, width='stretch')

def show_forecasting(forecast, gavi_alerts):
    """Forecasting analysis"""
    st.header("🔮 Predictive Forecasting")
    
    st.markdown("""
    ### Forecast Model
    
    **Method:** Trend-based extrapolation  
    **Formula:** `Future_WL = Last_WL + Mean_Historical_Delta`  
    **Horizons:** 1-year and 3-year forecasts
    """)
    
    st.divider()
    
    # Forecast statistics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        future_critical_1y = (forecast['GAVI_forecast_1y'] < 25).sum()
        st.metric("🔴 Future Critical (1Y)", f"{future_critical_1y:,}")
    
    with col2:
        future_critical_3y = (forecast['GAVI_forecast_3y'] < 25).sum()
        st.metric("🔴 Future Critical (3Y)", f"{future_critical_3y:,}")
    
    with col3:
        recovery_expected = (forecast['FUTURE_ALERT_3y'] == 'RECOVERY_EXPECTED').sum()
        st.metric("🟢 Recovery Expected", f"{recovery_expected:,}")
    
    # Future alert distribution
    st.subheader("📊 Future Alert Distribution")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**1-Year Forecast**")
        alert_1y = forecast['FUTURE_ALERT_1y'].value_counts()
        fig = px.pie(values=alert_1y.values, names=alert_1y.index)
        fig.update_layout(height=350)
        st.plotly_chart(fig, width='stretch')
    
    with col2:
        st.write("**3-Year Forecast**")
        alert_3y = forecast['FUTURE_ALERT_3y'].value_counts()
        fig = px.pie(values=alert_3y.values, names=alert_3y.index)
        fig.update_layout(height=350)
        st.plotly_chart(fig, width='stretch')
    
    # GAVI forecast comparison
    st.subheader("📈 Current vs Forecasted GAVI")
    
    forecast_comparison = forecast[['GAVI', 'GAVI_forecast_1y', 'GAVI_forecast_3y']].copy()
    forecast_comparison.columns = ['Current', '1-Year', '3-Year']
    
    fig = go.Figure()
    fig.add_trace(go.Histogram(x=forecast_comparison['Current'], name='Current', opacity=0.7))
    fig.add_trace(go.Histogram(x=forecast_comparison['1-Year'], name='1-Year', opacity=0.7))
    fig.add_trace(go.Histogram(x=forecast_comparison['3-Year'], name='3-Year', opacity=0.7))
    
    fig.update_layout(
        barmode='overlay',
        xaxis_title="GAVI Score",
        yaxis_title="Frequency",
        height=400
    )
    st.plotly_chart(fig, width='stretch')
    
    # Critical stations table
    st.subheader("⚠️ Stations Predicted to Become Critical")
    critical_future = forecast[
        (forecast['GAVI'] >= 25) & 
        ((forecast['GAVI_forecast_1y'] < 25) | (forecast['GAVI_forecast_3y'] < 25))
    ][['station_id', 'STATE_UT', 'DISTRICT', 'GAVI', 'GAVI_forecast_1y', 'GAVI_forecast_3y']]
    
    if len(critical_future) > 0:
        st.dataframe(critical_future.head(20), width='stretch', hide_index=True)
    else:
        st.info("No stations predicted to become critical")

def show_station_explorer(gavi_alerts, forecast):
    """Station-level exploration"""
    st.header("📍 Station Explorer")
    
    # Station selection
    stations = sorted(gavi_alerts['station_id'].unique())
    selected_station = st.selectbox("Select Station", stations)
    
    if selected_station:
        # Get station data
        station_data = gavi_alerts[gavi_alerts['station_id'] == selected_station].sort_values('year')
        station_forecast = forecast[forecast['station_id'] == selected_station]
        
        if len(station_data) > 0:
            # Station info
            st.subheader("ℹ️ Station Information")
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.write(f"**State:** {station_data.iloc[0]['STATE_UT']}")
                st.write(f"**District:** {station_data.iloc[0]['DISTRICT']}")
            
            with col2:
                st.write(f"**Latitude:** {station_data.iloc[0]['LATITUDE']}")
                st.write(f"**Longitude:** {station_data.iloc[0]['LONGITUDE']}")
            
            with col3:
                latest_gavi = station_data.iloc[-1]['GAVI']
                latest_category = station_data.iloc[-1]['GAVI_CATEGORY']
                st.write(f"**Current GAVI:** {latest_gavi:.2f}")
                st.write(f"**Category:** {latest_category}")
            
            # Time series
            st.subheader("📈 Historical Trend")
            
            fig = make_subplots(
                rows=2, cols=1,
                subplot_titles=('Water Level (mbgl)', 'GAVI Score'),
                vertical_spacing=0.15
            )
            
            # Water level
            fig.add_trace(
                go.Scatter(
                    x=station_data['year'],
                    y=station_data['WL_MBGL'],
                    mode='lines+markers',
                    name='Water Level',
                    line=dict(color='blue')
                ),
                row=1, col=1
            )
            
            # GAVI
            fig.add_trace(
                go.Scatter(
                    x=station_data['year'],
                    y=station_data['GAVI'],
                    mode='lines+markers',
                    name='GAVI',
                    line=dict(color='green')
                ),
                row=2, col=1
            )
            
            # Add forecast if available
            if len(station_forecast) > 0:
                last_year = station_data['year'].max()
                fig.add_trace(
                    go.Scatter(
                        x=[last_year, last_year + 1, last_year + 3],
                        y=[station_data.iloc[-1]['GAVI'], 
                           station_forecast.iloc[0]['GAVI_forecast_1y'],
                           station_forecast.iloc[0]['GAVI_forecast_3y']],
                        mode='lines+markers',
                        name='Forecast',
                        line=dict(color='red', dash='dash')
                    ),
                    row=2, col=1
                )
            
            fig.add_hline(y=50, line_dash="dash", line_color="orange", row=2, col=1)
            fig.add_hline(y=25, line_dash="dash", line_color="red", row=2, col=1)
            
            fig.update_xaxes(title_text="Year", row=2, col=1)
            fig.update_yaxes(title_text="WL (mbgl)", row=1, col=1)
            fig.update_yaxes(title_text="GAVI", row=2, col=1)
            
            fig.update_layout(height=600, showlegend=True)
            st.plotly_chart(fig, width='stretch')
            
            # Alert history
            st.subheader("🚨 Alert History")
            alert_history = station_data[station_data['ALERT_CONFIRMED'] != 'NORMAL'][
                ['year', 'ALERT_CONFIRMED', 'ALERT_SEVERITY', 'SUGGESTED_ACTION']
            ]
            
            if len(alert_history) > 0:
                st.dataframe(alert_history, width='stretch', hide_index=True)
            else:
                st.success("No alerts recorded for this station")

if __name__ == "__main__":
    main()
