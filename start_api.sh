#!/bin/bash
# JalDrishti API - Quick Start Script for Linux/macOS

echo "============================================================"
echo " JalDrishti Groundwater Intelligence API"
echo " Quick Start Script"
echo "============================================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "[1/4] Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        echo "Please ensure Python 3.9+ is installed"
        exit 1
    fi
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

echo ""
echo "[2/4] Activating virtual environment..."
source venv/bin/activate

echo ""
echo "[3/4] Installing dependencies..."
pip install -r requirements.txt --quiet
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"

echo ""
echo "[4/4] Starting FastAPI server..."
echo ""
echo "============================================================"
echo " Server will start at: http://localhost:8000"
echo " Interactive docs: http://localhost:8000/docs"
echo " Press Ctrl+C to stop the server"
echo "============================================================"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
