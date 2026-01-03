"""
Simple test script to verify API functionality
Run after starting the server: uvicorn app.main:app --reload
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url):
    """Test a single endpoint"""
    print(f"\n{'='*70}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print('='*70)
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response (first 500 chars):")
            print(json.dumps(data, indent=2)[:500] + "...")
            print("✅ SUCCESS")
        else:
            print(f"❌ ERROR: {response.text}")
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

def main():
    """Run all test cases"""
    print("🧪 JalDrishti API Test Suite")
    print("="*70)
    print("Make sure the server is running: uvicorn app.main:app --reload")
    print("="*70)
    
    # Test cases
    tests = [
        ("Root Endpoint", f"{BASE_URL}/"),
        ("Health Check", f"{BASE_URL}/health"),
        ("National Summary", f"{BASE_URL}/api/summary/national"),
        ("District Summary (Top 5)", f"{BASE_URL}/api/summary/districts?limit=5"),
        ("State Summary", f"{BASE_URL}/api/summary/states"),
        ("Station Alerts (Gujarat, 10 results)", f"{BASE_URL}/api/stations/alerts?state=Gujarat&limit=10"),
        ("Critical Alerts", f"{BASE_URL}/api/alerts/critical"),
        ("Alerts by Type", f"{BASE_URL}/api/alerts/by-type"),
        ("Future Risk Analysis", f"{BASE_URL}/api/alerts/future-risk?horizon=1y"),
        ("Report Metadata", f"{BASE_URL}/api/reports/metadata"),
    ]
    
    for name, url in tests:
        test_endpoint(name, url)
    
    print("\n" + "="*70)
    print("✅ Test suite complete!")
    print("="*70)
    print("\n📖 View interactive docs at: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
