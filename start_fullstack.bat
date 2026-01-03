@echo off
echo ========================================
echo JalDrishti - Full Stack Quick Start
echo ========================================
echo.

echo Step 1: Starting Backend API...
echo.

cd "%~dp0"

REM Start backend in new window
start "JalDrishti API" cmd /k "uvicorn app.main:app --reload"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Step 2: Starting Frontend Dashboard...
echo.

REM Start frontend in new window
start "JalDrishti Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo JalDrishti is starting!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend Dashboard: http://localhost:3000
echo.
echo API Docs: http://localhost:8000/docs
echo.
echo Both servers will open in separate windows.
echo Close those windows to stop the servers.
echo.
pause
