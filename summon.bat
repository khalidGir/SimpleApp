@echo off
echo ==========================================
echo    SUMMONING ORBITAL COMMAND SaaS...
echo ==========================================
echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is NOT running. Please start Docker Desktop first!
    pause
    exit /b
)

echo Starting the Factory Engine...
docker-compose up -d --build

echo ==========================================
echo    SUCCESS: SYSTEM IS LIVE AT:
echo    - Frontend: http://localhost
echo    - API: http://localhost:5000
echo ==========================================
echo To stop the system, type: docker-compose down
pause
