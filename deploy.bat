@echo off
REM ============================================
REM JalDrishti - Docker Deployment Script
REM ============================================
REM Usage: deploy.bat [dev|prod|stop|logs|status]

setlocal EnableDelayedExpansion

REM Change to script directory
cd /d "%~dp0"

REM Check command
set "CMD=%~1"
if "%CMD%"=="" set "CMD=help"

REM Route to appropriate function
if /i "%CMD%"=="dev" goto :deploy_dev
if /i "%CMD%"=="prod" goto :deploy_prod
if /i "%CMD%"=="stop" goto :stop_containers
if /i "%CMD%"=="logs" goto :show_logs
if /i "%CMD%"=="status" goto :show_status
if /i "%CMD%"=="clean" goto :clean_all
goto :show_help

:print_header
echo.
echo ============================================
echo   JalDrishti - Deployment Manager
echo ============================================
echo.
goto :eof

:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)
echo [OK] Docker is available
goto :eof

:deploy_dev
call :print_header
echo Deploying in DEVELOPMENT mode...
echo.

call :check_docker
if errorlevel 1 exit /b 1

echo Building and starting containers...
docker compose -f docker-compose.dev.yml up --build -d

echo.
echo [SUCCESS] Development deployment complete!
echo.
echo Access points:
echo   Frontend:  http://localhost:3000
echo   API:       http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
goto :eof

:deploy_prod
call :print_header
echo Deploying in PRODUCTION mode...
echo.

call :check_docker
if errorlevel 1 exit /b 1

REM Check for .env file
if not exist ".env" (
    echo [WARNING] .env file not found. Copying from .env.example...
    copy .env.example .env
)

echo Building and starting containers...
docker compose -f docker-compose.yml up --build -d

echo.
echo [SUCCESS] Production deployment complete!
echo.
echo Access points:
echo   Frontend:  http://localhost:3000
echo   API:       http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
goto :eof

:stop_containers
call :print_header
echo Stopping all JalDrishti containers...

docker compose -f docker-compose.yml down 2>nul
docker compose -f docker-compose.dev.yml down 2>nul

echo [SUCCESS] All containers stopped
goto :eof

:show_logs
call :print_header
echo Showing logs (Ctrl+C to exit)...
echo.

docker compose -f docker-compose.yml logs -f 2>nul || docker compose -f docker-compose.dev.yml logs -f
goto :eof

:show_status
call :print_header
echo Container Status:
echo.

docker ps --filter "name=jaldrishti" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo Health Check:

curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] API is not responding
) else (
    echo [OK] API is healthy
)

curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Frontend is not responding
) else (
    echo [OK] Frontend is healthy
)
goto :eof

:clean_all
call :print_header
echo Cleaning all JalDrishti Docker resources...

docker compose -f docker-compose.yml down -v 2>nul
docker compose -f docker-compose.dev.yml down -v 2>nul

echo [SUCCESS] Cleanup complete
goto :eof

:show_help
call :print_header
echo Usage: deploy.bat [command]
echo.
echo Commands:
echo   dev      Deploy in development mode
echo   prod     Deploy in production mode
echo   stop     Stop all containers
echo   logs     Show container logs
echo   status   Show container status
echo   clean    Remove all Docker resources
echo   help     Show this help message
echo.
goto :eof
