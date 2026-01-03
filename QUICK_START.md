# 🚀 Quick Start Guide - Get Your API Running in 5 Minutes

## Step 1: Open Terminal/Command Prompt

**Windows:** Press `Win + R`, type `cmd`, press Enter  
**Mac:** Press `Cmd + Space`, type `terminal`, press Enter  
**Linux:** Press `Ctrl + Alt + T`

---

## Step 2: Navigate to Project Directory

```bash
cd C:\Users\lsing\Desktop\tabula
```

---

## Step 3: Run the Quick Start Script

### Windows
```bash
start_api.bat
```

### Mac/Linux
```bash
chmod +x start_api.sh
./start_api.sh
```

**What happens:**
- ✅ Creates virtual environment (if needed)
- ✅ Installs dependencies
- ✅ Starts FastAPI server
- ✅ Loads all CSV data into memory

**Wait for:** "✅ API ready to serve requests!"

---

## Step 4: Open Your Browser

Go to: **http://localhost:8000/docs**

You should see the interactive API documentation (Swagger UI).

---

## Step 5: Try Your First API Call

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

## 🛑 Stopping the Server

Press **Ctrl + C** in the terminal where the server is running.

---

## 📚 Full Documentation

- **Complete API Docs:** [README_API.md](README_API.md)
- **Example Responses:** [API_EXAMPLES.md](API_EXAMPLES.md)
- **Architecture:** [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Deployment:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🎨 Integrate with Frontend

### JavaScript Example
```javascript
async function getNationalSummary() {
  const response = await fetch('http://localhost:8000/api/summary/national');
  const data = await response.json();
  
  console.log('Total Stations:', data.total_stations);
  console.log('Stressed %:', data.stressed_percentage);
  console.log('Average GAVI:', data.average_gavi);
}

getNationalSummary();
```

### Python Example
```python
import requests

response = requests.get('http://localhost:8000/api/summary/national')
data = response.json()

print(f"Total Stations: {data['total_stations']}")
print(f"Stressed %: {data['stressed_percentage']}")
print(f"Average GAVI: {data['average_gavi']}")
```

---

## ✨ You're All Set!

Your groundwater intelligence API is now running and ready to power:
- 📊 Dashboard applications
- 🗺️ Interactive maps
- 📱 Mobile apps
- 📈 Analytics tools
- 🏛️ Policy platforms

**Happy Building! 🌊💧**

---

**Need Help?**
- Check [README_API.md](README_API.md) for detailed documentation
- Run `python test_api.py` to test all endpoints
- View logs in terminal for debugging

**Pro Tip:** Keep the server running in one terminal and test in another!
