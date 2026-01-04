# 🚀 Quick Start Guide - Get JalDrishti Running in 5 Minutes

## Prerequisites

- **Python** 3.9+ with pip
- **Node.js** 18.0+ with npm (for frontend)
- **Git** (optional)

---

## 🎯 Option 1: Full Stack Quick Start (Recommended)

Start both backend API and frontend dashboard with one command:

### Windows
```bash
cd C:\Users\lsing\Desktop\tabula
start_fullstack.bat
```

### Mac/Linux
```bash
cd ~/tabula
chmod +x start_fullstack.sh
./start_fullstack.sh
```

**What happens:**
- ✅ Starts backend API on port 8000
- ✅ Starts frontend dashboard on port 3000
- ✅ Opens both in separate terminal windows

**Access:**
- 🌐 **Dashboard**: http://localhost:3000
- 📡 **API Docs**: http://localhost:8000/docs

---

## 🔧 Option 2: Manual Setup

### Step 1: Backend API

```bash
cd C:\Users\lsing\Desktop\tabula

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8000
```

**Wait for:** "✅ API ready to serve requests!"

### Step 2: Frontend Dashboard (New Terminal)

```bash
cd C:\Users\lsing\Desktop\tabula\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Wait for:** "▲ Next.js 14.0.4 ready"

---

## Step 3: Verify Installation

### Option A: Use the Interactive Docs
1. Click on "GET /api/summary/national"
2. Click "Try it out"
3. Click "Execute"
4. See the response below!

### Option B: Use curl (in another terminal)
```bash
curl http://localhost:8000/api/summary/national
```

### Option C: Use Browser
Open: **http://localhost:8000/api/summary/national**

---

## ✅ Expected Response

```json
{
  "total_stations": 9547,
  "stressed_percentage": 45.23,
  "average_gavi": 52.34,
  "active_critical_alerts": 234,
  "year": 2024
}
```

**If you see this, congratulations! Your API is working! 🎉**

---

## 🎯 Next Steps

### Explore More Endpoints

**1. Top 10 Critical Districts**
```
http://localhost:8000/api/summary/districts?sort_by=stressed_ratio&limit=10
```

**2. Station Alerts for Gujarat**
```
http://localhost:8000/api/stations/alerts?state=Gujarat&limit=100
```

**3. Critical Alert Summary**
```
http://localhost:8000/api/alerts/critical
```

**4. Download District Stress Report**
```
http://localhost:8000/api/reports/download?report_type=district_stress
```

---

## 🔧 Troubleshooting

### Issue: "python not found"
**Solution:** Install Python 3.9+ from https://www.python.org/downloads/

### Issue: "Module not found"
**Solution:** Run manually:
```bash
pip install -r requirements.txt
```

### Issue: "Address already in use"
**Solution:** Kill process on port 8000 or use different port:
```bash
uvicorn app.main:app --reload --port 8001
```

### Issue: "Data files not found"
**Solution:** Make sure `output/` directory has all CSV files from Jupyter notebooks

---

## 🛑 Stopping the Servers

Press **Ctrl + C** in the terminal where each server is running.

---

## 📚 Full Documentation

- **Master README:** [README.md](README.md)
- **Complete API Docs:** [README_API.md](README_API.md)
- **Example Responses:** [API_EXAMPLES.md](API_EXAMPLES.md)
- **Project Structure:** [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Deployment:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🎨 Frontend Pages

Once running, explore these dashboard pages:

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | http://localhost:3000 | National overview |
| Districts | http://localhost:3000/districts | Interactive map |
| Alerts | http://localhost:3000/alerts | Alert center |
| Forecast | http://localhost:3000/forecast | Future risk |
| Reports | http://localhost:3000/reports | CSV downloads |
| Stations | http://localhost:3000/stations | Station explorer |

---

## ✨ You're All Set!

Your groundwater intelligence platform is now running:

- 📊 **Dashboard** at http://localhost:3000
- 📡 **API** at http://localhost:8000
- 📖 **API Docs** at http://localhost:8000/docs

**Happy Exploring! 🌊💧**

---

**Need Help?**
- Check [README.md](README.md) for comprehensive documentation
- Run `python test_api.py` to test all endpoints
- View logs in terminal for debugging

**Pro Tip:** Keep both servers running - frontend connects to backend automatically!
