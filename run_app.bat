@echo off
echo Starting JalDrishti Streamlit Dashboard...
echo.
echo The application will open in your default browser.
echo Press Ctrl+C to stop the server.
echo.
if exist "%~dp0.venv\Scripts\python.exe" (
    "%~dp0.venv\Scripts\python.exe" -m streamlit run "%~dp0app.py"
) else (
    streamlit run "%~dp0app.py"
)
