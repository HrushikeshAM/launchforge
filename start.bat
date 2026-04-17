@echo off
echo Starting LaunchForge...

:: Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed! Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Install dependencies
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo Starting servers...
start "LaunchForge Servers" cmd /c "npm run dev"

:: Wait a few seconds for servers to initialize
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:5173

echo LaunchForge is running in a separate window.
echo Close that window or run stop.bat to shut down.
pause
