@echo off
REM JalDrishti API - Quick Start Script for Windows

echo ============================================================
echo  JalDrishti Groundwater Intelligence API
echo  Quick Start Script
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo [1/4] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        echo Please ensure Python 3.9+ is installed
        pause
        exit /b 1
    )
    echo ✓ Virtual environment created
) else (
    echo ✓ Virtual environment already exists
)

echo.
echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo [3/4] Installing dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [4/4] Starting FastAPI server...
echo.
echo ============================================================
echo  Server will start at: http://localhost:8000
echo  Interactive docs: http://localhost:8000/docs
echo  Press Ctrl+C to stop the server
echo ============================================================
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
