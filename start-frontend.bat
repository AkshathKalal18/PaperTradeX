@echo off
echo ============================================
echo  PaperTradeX Frontend - Starting...
echo ============================================
echo.
echo Frontend will be available at:
echo   http://localhost:5173
echo.
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
npm run dev
pause
