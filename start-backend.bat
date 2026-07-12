@echo off
echo ============================================
echo  PaperTradeX Backend - Starting...
echo ============================================
echo.

echo Backend will be available at:
echo   http://localhost:8080/api
echo   H2 Console: http://localhost:8080/api/h2-console
echo.

REM Try Maven from PATH first
where mvn >nul 2>&1

IF %ERRORLEVEL% EQU 0 (
    mvn spring-boot:run
) ELSE (
    REM Use IntelliJ's bundled Maven
    set "MVN=C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.3\plugins\maven\lib\maven3\bin\mvn.cmd"

    IF EXIST "%MVN%" (
        call "%MVN%" spring-boot:run
    ) ELSE (
        echo.
        echo ERROR: Maven not found.
        echo Please install Maven or add it to PATH.
    )
)

pause