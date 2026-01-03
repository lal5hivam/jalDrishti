@echo off
echo ================================
echo JalDrishti Frontend - Quick Start
echo ================================
echo.

cd frontend

echo Checking for node_modules...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

echo Starting Next.js development server...
echo.
echo Dashboard will be available at:
echo http://localhost:3000
echo.
echo API Backend should be running at:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
