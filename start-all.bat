@echo off
echo ============================================
echo  PaperTradeX - Starting All Services
echo ============================================
echo.

:: Detect Maven
where mvn >nul 2>&1
IF %ERRORLEVEL% == 0 (
    SET MVN=mvn
) ELSE (
    SET MVN="C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.3\plugins\maven\lib\maven3\bin\mvn.cmd"
)

echo Starting Backend (Spring Boot) in new window...
start "PaperTradeX Backend" cmd /k "%MVN% spring-boot:run"

echo Waiting 20 seconds for backend to initialize...
timeout /t 20 /nobreak >nul

echo Starting Frontend (React/Vite) in new window...
start "PaperTradeX Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ============================================
echo  Both services are starting!
echo.
echo  Backend:  http://localhost:8080/api
echo  Frontend: http://localhost:5173
echo  H2 DB:    http://localhost:8080/api/h2-console
echo.
echo  Default login: user@papertradex.com / userpassword
echo  Admin login:   admin@papertradex.com / adminpassword
echo ============================================
pause
